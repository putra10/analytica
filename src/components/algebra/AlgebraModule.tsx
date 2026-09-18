import { useState } from 'react'
import { useT } from '../../lib/i18n'
import { SubTabs } from '../navigation/TabNav'
import { GroupLab } from './GroupLab'
import { PermutationLab } from './PermutationLab'
import { RingLab } from './RingLab'
import { PolynomialLab } from './PolynomialLab'

type Sub = 'groups' | 'perm' | 'rings' | 'poly'

export function AlgebraModule() {
  const t = useT()
  const [sub, setSub] = useState<Sub>('groups')
  return (
    <div className="space-y-4">
      <SubTabs
        active={sub}
        onChange={setSub}
        tabs={[
          { id: 'groups', label: t('Grup: Subgrup, Koset, Grup Faktor', 'Groups: Subgroups, Cosets, Factor Groups') },
          { id: 'perm', label: t('Grup Simetri Sₙ', 'Symmetric Group Sₙ') },
          { id: 'rings', label: t('Gelanggang Zₙ & Ideal', 'Rings Zₙ & Ideals') },
          { id: 'poly', label: t('Gelanggang Polinom', 'Polynomial Rings') },
        ]}
      />
      {sub === 'groups' && <GroupLab />}
      {sub === 'perm' && <PermutationLab />}
      {sub === 'rings' && <RingLab />}
      {sub === 'poly' && <PolynomialLab />}
    </div>
  )
}
