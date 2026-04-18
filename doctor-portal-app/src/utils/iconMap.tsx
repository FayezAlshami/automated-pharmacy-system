import {
  Baby,
  BrainCircuit,
  Flower2,
  HeartPulse,
  PillBottle,
  ScanFace,
  ShieldAlert,
  ShieldPlus,
  Sparkles,
  Stethoscope,
  Syringe,
  UtensilsCrossed,
  Wind,
} from 'lucide-react'

export function renderCategoryIcon(iconName: string, className: string) {
  switch (iconName) {
    case 'PillBottle':
      return <PillBottle className={className} />
    case 'Syringe':
      return <Syringe className={className} />
    case 'HeartPulse':
      return <HeartPulse className={className} />
    case 'ShieldPlus':
      return <ShieldPlus className={className} />
    case 'Baby':
      return <Baby className={className} />
    case 'Sparkles':
      return <Sparkles className={className} />
    case 'UtensilsCrossed':
      return <UtensilsCrossed className={className} />
    case 'Flower2':
      return <Flower2 className={className} />
    case 'ScanFace':
      return <ScanFace className={className} />
    case 'Wind':
      return <Wind className={className} />
    case 'BrainCircuit':
      return <BrainCircuit className={className} />
    case 'ShieldAlert':
      return <ShieldAlert className={className} />
    default:
      return <Stethoscope className={className} />
  }
}
