# analytica

## Commits

- Commit as the repo owner: `putra10 <putrarafy3@gmail.com>`. Check
  `git config user.name` / `user.email` before the first commit of a session —
  remote containers default to a Claude identity, which puts Claude in the
  repository's contributor list.
- No AI attribution anywhere in the repo: no `Co-Authored-By`, no
  `Claude-Session`, no "generated with" lines in commit messages, PR bodies or
  code comments.

## Working notes

- Verify UI changes in a real browser at mobile widths (320/390/414px), not by
  reading CSS. `html { overflow-x: clip }` hides page overflow, so check
  `window.innerWidth === document.documentElement.clientWidth` — if they differ,
  the browser has zoomed out to fit overflowing content.
- Grid and flex items default to `min-width: auto`, so unbreakable content
  (KaTeX is the usual culprit) sets their minimum width and blows out the page.
  `min-w-0` on the item, scrolling on the formula's own wrapper.
- `npm run lint`, `npm run build` and `npm run check` before pushing.
