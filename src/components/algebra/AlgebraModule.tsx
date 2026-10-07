import { SyllabusWorkbench } from '../ui/SyllabusWorkbench'
import { useState } from 'react'
import { useT } from '../../lib/i18n'
import { SubTabs } from '../navigation/TabNav'
import { GroupLab } from './GroupLab'
import { PermutationLab } from './PermutationLab'
import { RingLab } from './RingLab'
import { PolynomialLab } from './PolynomialLab'
import { IsoLab } from './IsoLab'

type Sub = 'groups' | 'perm' | 'rings' | 'poly' | 'iso'

export function AlgebraModule() {
  const t = useT()
  const [sub, setSub] = useState<Sub>(()=>{const lab=new URLSearchParams(location.hash.split('?')[1]??'').get('lab');return ['groups','perm','rings','poly','iso'].includes(lab??'')?lab as Sub:'groups'})
  return (
    <div className="space-y-4">
      <SyllabusWorkbench course="algebra" onLab={lab=>{if(['groups','perm','rings','poly','iso'].includes(lab))setSub(lab as Sub)}} />
      <SubTabs
        active={sub}
        onChange={setSub}
        tabs={[
          { id: 'groups', label: t('Grup: Subgrup, Koset, Grup Faktor', 'Groups: Subgroups, Cosets, Factor Groups') },
          { id: 'perm', label: t('Grup Simetri Sₙ', 'Symmetric Group Sₙ') },
          { id: 'rings', label: t('Gelanggang Zₙ & Ideal', 'Rings Zₙ & Ideals') },
          { id: 'poly', label: t('Gelanggang Polinom', 'Polynomial Rings') },
          { id: 'iso', label: t('Isomorfisma Grup & Gelanggang', 'Group & Ring Isomorphism') },
        ]}
      />
      {sub === 'groups' && <GroupLab />}
      {sub === 'perm' && <PermutationLab />}
      {sub === 'rings' && <RingLab />}
      {sub === 'poly' && <PolynomialLab />}
      {sub === 'iso' && <IsoLab />}
    </div>
  )
}
