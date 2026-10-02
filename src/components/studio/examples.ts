import type { L } from '../../lib/studio'

/** Example worksheets per course topic. A leading "~" starts the row hidden. */
export const EXAMPLES: { key: string; mode: '2D' | '3D'; label: L; rows: string[] }[] = [
  { key: 'basic2', mode: '2D', label: { id: 'Dasar 2D', en: 'Basics 2D' }, rows: ['A = (-2,1)', 'B = (2,3)', 'l = line(A,B)', 'c = circle(A,2)', 'y = sin(x)', 'distance(A,B)', 'area(c)'] },
  { key: 'basic3', mode: '3D', label: { id: 'Dasar 3D', en: 'Basics 3D' }, rows: ['A = (1,2,3)', 'B = (-2,-1,0)', 'l = line(A,B)', 'p = plane(0,0,1,-1)', 's = sphere((0,0,0),1.5)', 'I = intersect(l,p)', 'distance(A,p)'] },
  {
    key: 'lines', mode: '3D', label: { id: 'Garis & bidang di R³', en: 'Lines & planes in R³' },
    rows: ['A = (1,2,-1)', 'B = (3,1,2)', 'l = line(A,B)', 'm = (x+1)/1 = y/2 = (z-3)/(-1)', 'position(l,m)', 'distance(l,m)', 'perpendicular(l,m)',
      'p = 2x - y + 2z - 3 = 0', 'P = (2,-1,3)', 'distance(P,p)', 'projection(P,p)', 'intersect(l,p)', 'angle(l,p)', 'q = plane((1,0,0),(0,1,0),(0,0,1))', 'intersect(p,q)', 'angle(p,q)'],
  },
  {
    key: 'circles', mode: '2D', label: { id: 'Lingkaran: kuasa, polar, berkas', en: 'Circles: power, polar, pencil' },
    rows: ['c1 = x^2+y^2-4x-2y-4=0', 'P = (6,4)', 'power(P,c1)', 'polar(P,c1)', 'tangent(P,c1)', 'c2 = x^2+y^2+2x-6y+6=0', 'radical(c1,c2)', 'intersect(c1,c2)', 'c3 = x^2+y^2-10y+16=0', 'radical(c1,c2,c3)', 'pencil(c1,c2,1/2)'],
  },
  {
    key: 'spheres', mode: '3D', label: { id: 'Bola dan bidang', en: 'Spheres and planes' },
    rows: ['s = x^2+y^2+z^2-2x+4y-6z-11=0', 'p = 2x-y+2z-1=0', 'intersect(s,p)', 'P = (7,1,3)', 'power(P,s)', 'polar(P,s)', 'T = (1,-2,8)', 'tangent(T,s)', 'l = line(P,(1,-2,3))', 'intersect(l,s)'],
  },
  {
    key: 'conics', mode: '2D', label: { id: 'Klasifikasi konik', en: 'Conic classification' },
    rows: ['C1 = 5x^2+24xy-2y^2+4x-1=0', 'classify(C1)', 'center(C1)', '~C2 = x^2-4xy+8y^2-8x+6y-5=0', '~classify(C2)', '~C3 = 9x^2+24xy+16y^2-40x+30y=0', '~classify(C3)', '~C4 = x^2-y^2+2x+4y-3=0', '~classify(C4)'],
  },
  {
    key: 'quadrics', mode: '3D', label: { id: 'Klasifikasi kuadrik', en: 'Quadric classification' },
    rows: ['Q1 = x^2+y^2-3z^2-2xy-6xz-6yz+2x+2y+4z=0', 'classify(Q1)', '~Q2 = 3x^2+y^2-z^2+6xz-4y=0', '~classify(Q2)', '~Q3 = 4x^2+2y^2+z^2-4xy-2yz-2y+2z-4=0', '~classify(Q3)'],
  },
  {
    key: 'transforms', mode: '2D', label: { id: 'Transformasi geometri', en: 'Geometric transformations' },
    rows: ['T = affine(0,-1,1,0,3,-1)', 'classify(T)', 'A = (1,2)', 'apply(T,A)', 'c = x^2+y^2-2x=0', 'apply(T,c)', 'm = line((0,0),(1,1))', 'S = reflect(m)', 'classify(S)', 'U = apply(T,S)', 'classify(U)',
      '~G = affine(2,1,1,1,0,0)', '~E = x^2/4+y^2=1', '~F = apply(G,E)', '~classify(F)'],
  },
]
