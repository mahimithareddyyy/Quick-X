import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import UserTypeSelection from "@/components/UserTypeSelection";
import AmountInput from "@/components/AmountInput";
import RealtimeMatchList from "@/components/RealtimeMatchList";
import ExchangeFlow from "@/components/ExchangeFlow";
import { LogOut, User } from "lucide-react";
import { createTypeRequest } from "@/integrations/firebase/utils";
import ActiveRequests from "@/components/ActiveRequest";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";


type ExchangeType = 'cash-to-upi' | 'upi-to-cash';
type AppStep = 'type-selection' | 'amount-input' | 'match-list' | 'exchange-flow';

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

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<AppStep>('type-selection');
  const [exchangeType, setExchangeType] = useState<ExchangeType | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-pulse">
          <img 
            src="/lovable-uploads/058fa7fe-01a6-425a-a726-bce5c262ab90.png" 
            alt="QuickX Logo" 
            className="h-20 w-auto mx-auto"
          />
        </div>
      </div>
    );
  }

  const handleSelectType = async (type: ExchangeType) => {
    setExchangeType(type);
    setStep('amount-input');
    try {
      // Create an initial request doc with pending status and no amount yet
      // We'll update when user enters amount; for now we only log the click if desired.
      // Skipping creation here to avoid empty records.
    } catch (_) {}
  };


  const handleFindMatch = async (amount: number, location: string) => {
    if (!user || isCreatingRequest) return;
  
    const kind: "type1" | "type2" = exchangeType === "upi-to-cash" ? "type1" : "type2";
    const collectionNames: ("type1Requests" | "type2Requests")[] = ["type1Requests", "type2Requests"];
  
    setIsCreatingRequest(true);
    
    try {
      // Check for any existing active request in both collections
      for (const colName of collectionNames) {
        const q = query(
          collection(db, colName),
          where("createdBy", "==", user.uid),
          where("status", "==", "active")
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          toast({
            variant: "destructive",
            title: "Request Already Active",
            description: "You already have an active request. Cancel or complete it first.",
          });
          return; // Stop execution if any active request exists
        }
      }
  
      // Only proceed if no active request exists
      await createTypeRequest(kind, {
        receiverId: user.uid,
        money: amount,
        status: "active",
        location,
        createdBy: user.uid,
      });
  
      // Store the amount and location for the next step
      setAmount(amount);
      setLocation(location);
      setStep("match-list");
  
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create request. Please try again.",
      });
    } finally {
      setIsCreatingRequest(false);
    }
  };
  
  const handleShowPeople = (amount: number, location: string,collectionName: string) => {
    console.log("Hi1");
    setExchangeType(collectionName === "type1Requests" ? "upi-to-cash" : "cash-to-upi");
    console.log("Hi2");
    setAmount(amount);
    setLocation(location);
    setStep("match-list");
  };
  

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setStep('exchange-flow');
  };

  const handleBack = () => {
    switch(step) {
      case 'amount-input':
        setStep('type-selection');
        setExchangeType(null);
        break;
      case 'match-list':
        setStep('amount-input');
        setAmount(null);
        break;
      case 'exchange-flow':
        setStep('match-list');
        setSelectedMatch(null);
        break;
      default:
        setStep('type-selection');
    }
  };

  const resetToHome = () => {
    setStep('type-selection');
    setExchangeType(null);
    setAmount(null);
    setSelectedMatch(null);
  };

  const myNeedType = exchangeType === 'cash-to-upi' ? 'need_upi' : 'need_cash';
  const targetNeedType = exchangeType === 'cash-to-upi' ? 'need_upi' : 'need_cash';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto p-4 max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <div 
            className="flex items-center cursor-pointer"
            onClick={resetToHome}
          >
            <img 
              src="/lovable-uploads/058fa7fe-01a6-425a-a726-bce5c262ab90.png" 
              alt="QuickX Logo" 
              className="h-12 w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => user && navigate(`/users/${user.uid}`)}
            >
              <User className="h-4 w-4" />
              <span className="text-sm">{user?.email?.split('@')[0]}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
  
        <div className="text-center py-4 space-y-2">
          <h1 className="text-xl font-semibold">QuickX Exchange</h1>
          <p className="text-muted-foreground">Instant cash ↔ UPI exchange</p>
        </div>
  
        {/* Main content */}
        <div className="pb-8">
          {step === 'type-selection' && (
            <>
            <UserTypeSelection onSelectType={handleSelectType} />
            <ActiveRequests onShowPeople={handleShowPeople} />
            </>
          )}
          
          {step === 'amount-input' && exchangeType && (
            <AmountInput 
              exchangeType={exchangeType}
              onBack={handleBack}
              onFindMatch={handleFindMatch}
              isCreatingRequest={isCreatingRequest} 
            />
          )}
          
          {step === 'match-list' && exchangeType && amount && (
            <RealtimeMatchList
              amount={amount}
              myNeedType={myNeedType}
              targetNeedType={targetNeedType}
              location={location ?? ''}
              onBack={handleBack}
              onMatchCreated={(matchId) => {
                // Navigate to exchange flow when match is created
                setStep('exchange-flow');
              }}
            />
          )}
          
          {step === 'exchange-flow' && selectedMatch && amount && exchangeType && (
            <ExchangeFlow
              match={selectedMatch}
              amount={amount}
              exchangeType={exchangeType}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
