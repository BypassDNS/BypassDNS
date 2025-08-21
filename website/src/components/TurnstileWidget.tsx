import { Turnstile } from '@marsidev/react-turnstile'

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onError: () => void
  onExpire: () => void
  className?: string
  key?: string | number // Add key prop to force re-render
}

const TurnstileWidget = ({ onVerify, onError, onExpire, className }: TurnstileWidgetProps) => {
  // Replace this with your actual Turnstile site key

  const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY
  
  return (
    <div className={className}>
      <Turnstile
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={onVerify}
        onError={onError}
        onExpire={onExpire}
      />
    </div>
  )
}

export default TurnstileWidget