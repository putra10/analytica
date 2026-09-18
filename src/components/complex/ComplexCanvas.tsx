import { useCallback, useEffect, useRef } from 'react'
import type { Complex, Contour, SingType } from '../../lib/complex-math'

export interface Mark {
  z: Complex
  kind: 'zero' | SingType
}
export interface Overlay {
  contour?: Contour
  marks: Mark[]
}

export interface View {
  cx: number
  cy: number
  /** complex-plane units per CSS pixel */
  scale: number
}

export const DEFAULT_VIEW: View = { cx: 0, cy: 0, scale: 0.01 }

interface Props {
  preset: number
  c: Complex
  mode: 'color' | 'grid'
  showGrid: boolean
  view: View
  onViewChange: (v: View) => void
  onHover: (z: Complex | null) => void
  overlay?: Overlay
  /** GLSL expression for the user formula (used when preset < 0) */
  customGLSL?: string
  onShaderError?: (msg: string | null) => void
}

const MARK_COLOR: Record<Mark['kind'], string> = {
  zero: '#0f172a', pole: '#ffffff', essential: '#f472b6', removable: '#a3e635', branch: '#fbbf24', user: '#ffffff',
}

const VERT = `#version 300 es
void main() {
  float x = float((gl_VertexID << 1) & 2);
  float y = float(gl_VertexID & 2);
  gl_Position = vec4(x * 2.0 - 1.0, y * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG_TEMPLATE = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uScale;
uniform vec2 uC;
uniform int uPreset;
uniform int uMode;
uniform int uGrid;
const float PI = 3.14159265358979;

vec2 cmul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }
vec2 cdiv(vec2 a, vec2 b) { float d = dot(b, b); return vec2(a.x * b.x + a.y * b.y, a.y * b.x - a.x * b.y) / d; }
vec2 cexp(vec2 z) { return exp(z.x) * vec2(cos(z.y), sin(z.y)); }
vec2 csin(vec2 z) { return vec2(sin(z.x) * cosh(z.y), cos(z.x) * sinh(z.y)); }

vec2 cinv(vec2 z) { return vec2(z.x, -z.y) / dot(z, z); }
vec2 clog(vec2 z) { return vec2(log(length(z)), atan(z.y, z.x)); }
vec2 csqrt(vec2 z) { float r = length(z); return vec2(sqrt(0.5 * (r + z.x)), (z.y < 0.0 ? -1.0 : 1.0) * sqrt(max(0.5 * (r - z.x), 0.0))); }
vec2 ccos(vec2 z) { return vec2(cos(z.x) * cosh(z.y), -sin(z.x) * sinh(z.y)); }
vec2 ctan(vec2 z) { return cdiv(csin(z), ccos(z)); }
vec2 csinh(vec2 z) { return vec2(sinh(z.x) * cos(z.y), cosh(z.x) * sin(z.y)); }
vec2 ccosh(vec2 z) { return vec2(cosh(z.x) * cos(z.y), sinh(z.x) * sin(z.y)); }
vec2 ctanh(vec2 z) { return cdiv(csinh(z), ccosh(z)); }
vec2 cconj(vec2 z) { return vec2(z.x, -z.y); }
vec2 cabs(vec2 z) { return vec2(length(z), 0.0); }
vec2 cre(vec2 z) { return vec2(z.x, 0.0); }
vec2 cim(vec2 z) { return vec2(z.y, 0.0); }
vec2 carg(vec2 z) { return vec2(atan(z.y, z.x), 0.0); }
vec2 cpow(vec2 a, vec2 b) { return cexp(cmul(b, clog(a))); }
vec2 cpowi(vec2 a, int n) { vec2 r = vec2(1.0, 0.0); for (int k = 0; k < 8; k++) { if (k < n) r = cmul(r, a); } return r; }

// branch order must match PRESETS in complex-math.ts; uPreset < 0 selects the user formula
vec2 f(vec2 z) {
  const vec2 ONE = vec2(1.0, 0.0);
  if (uPreset < 0) return /*CUSTOM*/;
  if (uPreset == 0) return cmul(z, z) + uC;
  else if (uPreset == 1) return cdiv(z - ONE, z + ONE);
  else if (uPreset == 2) return cexp(z);
  else if (uPreset == 3) return csin(z);
  else if (uPreset == 4) return cmul(cmul(z, z), z) - ONE;
  else if (uPreset == 5) return clog(z);
  else if (uPreset == 6) return csqrt(z);
  else if (uPreset == 7) return vec2(z.x, -z.y);
  else if (uPreset == 8) return vec2(dot(z, z), 0.0);
  else if (uPreset == 9) return cinv(z);
  else if (uPreset == 10) return cinv(cmul(z, z));
  else if (uPreset == 11) return cinv(cmul(z, z) + ONE);
  else if (uPreset == 12) return cexp(cinv(z));
  else if (uPreset == 13) return cdiv(csin(z), z);
  else if (uPreset == 14) return cinv(cmul(cmul(z, z - ONE), z - 2.0 * ONE));
  return cinv(csin(z));
}

vec3 hsv2rgb(vec3 c) {
  vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
  return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}

void main() {
  vec2 z = uCenter + (gl_FragCoord.xy - 0.5 * uRes) * uScale;
  vec2 w = f(z);
  float r = length(w);
  float hue = atan(w.y, w.x) / (2.0 * PI) + 0.5;

  // pulled-back Cartesian grid of the w-plane (Re w, Im w integer), ~1.5px wide
  vec2 dw = fwidth(w);
  float gx = 1.0 - smoothstep(0.0, 1.5 * dw.x, abs(fract(w.x + 0.5) - 0.5));
  float gy = 1.0 - smoothstep(0.0, 1.5 * dw.y, abs(fract(w.y + 0.5) - 0.5));
  float fade = 1.0 - smoothstep(0.15, 0.5, max(dw.x, dw.y));
  float grid = max(gx, gy) * fade;

  vec3 col;
  if (uMode == 0) {
    float m = r / (1.0 + r);                       // 0 at zeros, 1 at poles
    float band = fract(log2(max(r, 1e-6)));        // contour bands at |f| = 2^k
    float v = mix(0.12, 1.0, m) * (0.72 + 0.28 * band);
    float s = 1.0 - pow(m, 10.0);                  // desaturate to white at poles
    col = hsv2rgb(vec3(hue, s, v));
    if (uGrid == 1) col = mix(col, vec3(1.0), 0.55 * grid);
  } else {
    vec3 tint = hsv2rgb(vec3(hue, 0.55, 0.95));
    col = mix(vec3(0.05, 0.07, 0.13), tint, 0.16);
    col = mix(col, tint, 0.95 * grid);
  }

  // real / imaginary axes of the z-plane
  vec2 az = abs(z) / uScale;
  float axis = max(1.0 - smoothstep(0.5, 1.5, az.x), 1.0 - smoothstep(0.5, 1.5, az.y));
  col = mix(col, vec3(0.92), 0.35 * axis);
  fragColor = vec4(col, 1.0);
}`

const buildFrag = (custom: string) => FRAG_TEMPLATE.replace('/*CUSTOM*/', custom || 'z')

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? 'shader error')
  return sh
}

const UNIFORMS = ['uRes', 'uCenter', 'uScale', 'uC', 'uPreset', 'uMode', 'uGrid'] as const
type Uniforms = Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>

export function ComplexCanvas(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<{ gl: WebGL2RenderingContext; u: Uniforms } | null>(null)
  const propsRef = useRef(props)
  propsRef.current = props
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null)

  const draw = useCallback(() => {
    const g = glRef.current
    const canvas = canvasRef.current
    if (!g || !canvas) return
    const { gl, u } = g
    const { view, c, preset, mode, showGrid } = propsRef.current
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(u.uRes, canvas.width, canvas.height)
    gl.uniform2f(u.uCenter, view.cx, view.cy)
    gl.uniform1f(u.uScale, (view.scale * canvas.clientWidth) / canvas.width)
    gl.uniform2f(u.uC, c.re, c.im)
    gl.uniform1i(u.uPreset, preset)
    gl.uniform1i(u.uMode, mode === 'grid' ? 1 : 0)
    gl.uniform1i(u.uGrid, showGrid ? 1 : 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }, [])

  // GL context + resize + wheel (once)
  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: false })
    if (!gl) return
    glRef.current = { gl, u: Object.fromEntries(UNIFORMS.map((n) => [n, null])) as Uniforms }
    const ro = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      draw()
    })
    ro.observe(canvas)

    // wheel must be non-passive to stop page scroll; React attaches it passive
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const { view, onViewChange } = propsRef.current
      const rect = canvas.getBoundingClientRect()
      const px = e.clientX - rect.left - rect.width / 2
      const py = e.clientY - rect.top - rect.height / 2
      const factor = Math.exp(e.deltaY * 0.0012)
      const scale = Math.min(Math.max(view.scale * factor, 1e-5), 1)
      // keep the complex number under the cursor fixed
      onViewChange({ cx: view.cx + px * (view.scale - scale), cy: view.cy - py * (view.scale - scale), scale })
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      ro.disconnect()
      canvas.removeEventListener('wheel', onWheel)
      glRef.current = null // context itself is freed with the canvas; StrictMode remounts reuse it
    }
  }, [draw])

  // shader program: rebuilt when the user formula changes
  const customGLSL = props.customGLSL ?? ''
  useEffect(() => {
    const g = glRef.current
    if (!g) return
    const { gl } = g
    const prog = gl.createProgram()!
    try {
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, buildFrag(customGLSL)))
      gl.linkProgram(prog)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link error')
      gl.useProgram(prog)
      g.u = Object.fromEntries(UNIFORMS.map((n) => [n, gl.getUniformLocation(prog, n)])) as Uniforms
      propsRef.current.onShaderError?.(null)
      draw()
    } catch (e) {
      propsRef.current.onShaderError?.((e as Error).message)
    }
    return () => gl.deleteProgram(prog)
  }, [draw, customGLSL])

  useEffect(() => {
    const id = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(id)
  }, [draw, props.preset, props.c, props.mode, props.showGrid, props.view])

  // markers + contour, drawn in CSS pixels on a 2D canvas above the WebGL one
  useEffect(() => {
    const ov = overlayRef.current
    if (!ov) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = ov.clientWidth, H = ov.clientHeight
    ov.width = W * dpr
    ov.height = H * dpr
    const ctx = ov.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const { view, overlay } = props
    if (!overlay) return
    const P = (z: Complex) => [W / 2 + (z.re - view.cx) / view.scale, H / 2 - (z.im - view.cy) / view.scale] as const
    if (overlay.contour) {
      const [x, y] = P(overlay.contour.center)
      const r = overlay.contour.radius / view.scale
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.strokeStyle = '#facc15'
      ctx.lineWidth = 2
      ctx.setLineDash([])
      ctx.stroke()
      // orientation arrow at angle 0 (counter-clockwise on screen = positive)
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + r + 5, y + 9)
      ctx.lineTo(x + r - 5, y + 9)
      ctx.closePath()
      ctx.fillStyle = '#facc15'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    for (const m of overlay.marks) {
      const [x, y] = P(m.z)
      if (x < -20 || y < -20 || x > W + 20 || y > H + 20) continue
      ctx.lineWidth = 2
      ctx.strokeStyle = MARK_COLOR[m.kind]
      ctx.beginPath()
      if (m.kind === 'zero') {
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.strokeStyle = '#e2e8f0'
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.strokeStyle = '#0f172a'
        ctx.lineWidth = 1
        ctx.stroke()
      } else {
        ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6)
        ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6)
        ctx.stroke()
        ctx.strokeStyle = '#0f172a'
        ctx.lineWidth = 0.75
        ctx.stroke()
      }
    }
  }, [props.view, props.overlay])

  const toWorld = (e: React.PointerEvent): Complex => {
    const rect = e.currentTarget.getBoundingClientRect()
    const { view } = propsRef.current
    return {
      re: view.cx + (e.clientX - rect.left - rect.width / 2) * view.scale,
      im: view.cy - (e.clientY - rect.top - rect.height / 2) * view.scale,
    }
  }

  return (
    <div className="relative h-full w-full">
    <canvas ref={overlayRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full" />
    <canvas
      ref={canvasRef}
      className="h-full w-full cursor-crosshair touch-none rounded-lg"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        drag.current = { x: e.clientX, y: e.clientY, cx: props.view.cx, cy: props.view.cy }
      }}
      onPointerMove={(e) => {
        const { view, onViewChange, onHover } = propsRef.current
        if (drag.current) {
          onViewChange({
            ...view,
            cx: drag.current.cx - (e.clientX - drag.current.x) * view.scale,
            cy: drag.current.cy + (e.clientY - drag.current.y) * view.scale,
          })
        }
        onHover(toWorld(e))
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onPointerLeave={() => props.onHover(null)}
    />
    </div>
  )
}
