import { SyllabusWorkbench } from '../ui/SyllabusWorkbench'
import { useState } from 'react'
import { useT } from '../../lib/i18n'
import { SubTabs } from '../navigation/TabNav'
import { GroupLab } from './GroupLab'
import { HomTheoremsLab } from './HomTheoremsLab'
import { PermutationLab } from './PermutationLab'
import { RingLab } from './RingLab'
import { PolynomialLab } from './PolynomialLab'
import { IsoLab } from './IsoLab'

const SUBS = ['groups', 'thm', 'perm', 'rings', 'poly', 'iso'] as const
type Sub = typeof SUBS[number]
const isSub = (s: string | null): s is Sub => SUBS.includes(s as Sub)

export function AlgebraModule() {
  const t = useT()
  const [sub, setSub] = useState<Sub>(()=>{const lab=new URLSearchParams(location.hash.split('?')[1]??'').get('lab');return isSub(lab)?lab:'groups'})
  // bumped on every "Open lab tool" so the theorem lab re-reads the chosen syllabus topic
  const [opened, setOpened] = useState(0)
  return (
    <div className="space-y-4">
      <SyllabusWorkbench course="algebra" onLab={lab=>{if(isSub(lab)){setSub(lab);setOpened(n=>n+1)}}} />
      <SubTabs
        active={sub}
        onChange={setSub}
        tabs={[
          { id: 'groups', label: t('Grup: Subgrup, Koset, Grup Faktor', 'Groups: Subgroups, Cosets, Factor Groups') },
          { id: 'thm', label: t('Teorema Homomorfisma (2.7)', 'Homomorphism Theorems (2.7)') },
          { id: 'perm', label: t('Grup Simetri Sₙ', 'Symmetric Group Sₙ') },
          { id: 'rings', label: t('Gelanggang Zₙ & Ideal', 'Rings Zₙ & Ideals') },
          { id: 'poly', label: t('Gelanggang Polinom', 'Polynomial Rings') },
          { id: 'iso', label: t('Isomorfisma Grup & Gelanggang', 'Group & Ring Isomorphism') },
        ]}
      />
      {sub === 'groups' && <GroupLab />}
      {sub === 'thm' && <HomTheoremsLab key={opened} />}
      {sub === 'perm' && <PermutationLab />}
      {sub === 'rings' && <RingLab />}
      {sub === 'poly' && <PolynomialLab />}
      {sub === 'iso' && <IsoLab />}
    </div>
  )
}
