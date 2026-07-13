import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Star, MapPin, CheckCircle2, MessageCircle, Phone, Shield } from "lucide-react";

interface Match {
  id: string;
  name: string;
  trustScore: number;
  location: string;
  timeAgo: string;
  avatar: string;
  verified: boolean;
  completedExchanges: number;
}

interface ExchangeFlowProps {
  match: Match;
  amount: number;
  exchangeType: 'cash-to-upi' | 'upi-to-cash';
  onBack: () => void;
}

export default function ExchangeFlow({ match, amount, exchangeType, onBack }: ExchangeFlowProps) {
  const [step, setStep] = useState<'connect' | 'meeting' | 'exchange' | 'complete'>('connect');

  const getStepTitle = () => {
    switch(step) {
      case 'connect': return 'Connection Request';
      case 'meeting': return 'Meeting Details';
      case 'exchange': return 'Exchange in Progress';
      case 'complete': return 'Exchange Complete';
    }
  };

  const getStepDescription = () => {
    switch(step) {
      case 'connect': return 'Send a connection request to start the exchange';
      case 'meeting': return 'Coordinate your meeting location';
      case 'exchange': return 'Complete the exchange safely';
      case 'complete': return 'Rate your experience';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{getStepTitle()}</h2>
          <p className="text-muted-foreground">{getStepDescription()}</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center space-x-2">
        {['connect', 'meeting', 'exchange', 'complete'].map((stepName, index) => (
          <div key={stepName} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step === stepName ? 'bg-primary text-white' : 
              ['connect', 'meeting', 'exchange', 'complete'].indexOf(step) > index ? 'bg-secondary text-white' : 
              'bg-muted text-muted-foreground'
            }`}>
              {index + 1}
            </div>
            {index < 3 && <div className="w-8 h-1 bg-muted mx-1"></div>}
          </div>
        ))}
      </div>

      {/* Match info card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white font-semibold text-lg">
                {match.avatar}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold text-foreground">{match.name}</h3>
                {match.verified && (
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{match.trustScore}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{match.location}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {match.completedExchanges} successful exchanges
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exchange details */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="font-medium">Exchange Amount</span>
              <span className="text-2xl font-bold text-primary">₹{amount}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="font-medium">Exchange Type</span>
              <span className="font-semibold">
                {exchangeType === 'upi-to-cash' ? 'UPI → Cash' : 'Cash → UPI'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons based on step */}
      <div className="space-y-3">
        {step === 'connect' && (
          <>
            <Button 
              className="w-full h-12 text-base font-semibold shadow-[var(--shadow-button)]"
              onClick={() => setStep('meeting')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Send Connection Request
            </Button>
            <Button variant="outline" className="w-full h-12">
              <Phone className="w-5 h-5 mr-2" />
              Quick Call
            </Button>
          </>
        )}
        
        {step === 'meeting' && (
          <Button 
            className="w-full h-12 text-base font-semibold shadow-[var(--shadow-button)]"
            onClick={() => setStep('exchange')}
          >
            <MapPin className="w-5 h-5 mr-2" />
            Confirm Meeting Location
          </Button>
        )}
        
        {step === 'exchange' && (
          <Button 
            className="w-full h-12 text-base font-semibold shadow-[var(--shadow-button)]"
            onClick={() => setStep('complete')}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Confirm Exchange Complete
          </Button>
        )}
        
        {step === 'complete' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Exchange Successful!</h3>
            <p className="text-muted-foreground">Your exchange with {match.name} has been completed.</p>
            <Button 
              className="w-full h-12 text-base font-semibold"
              onClick={onBack}
            >
              Rate Experience
            </Button>
          </div>
        )}
      </div>

      {/* Safety reminder */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Safety Reminder</p>
              <p className="text-xs text-muted-foreground">
                Always meet in public campus areas. Verify the exchange amount before proceeding. Report any issues immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}