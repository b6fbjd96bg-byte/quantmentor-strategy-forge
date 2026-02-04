import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

const DisclaimerBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gold/10 border-b border-gold/20">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-gold flex-shrink-0" />
            <p className="text-foreground/90">
              <span className="font-semibold text-gold">Beta Notice:</span> QuantMentor is an upcoming startup. 
              All data displayed is for demonstration purposes only. Not financial advice.
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gold/70 hover:text-gold transition-colors flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerBanner;
