import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Star, MapPin, Clock, CheckCircle2 } from "lucide-react";

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

interface MatchListProps {
  amount: number;
  exchangeType: 'cash-to-upi' | 'upi-to-cash';
  onBack: () => void;
  onSelectMatch: (match: Match) => void;
}

export default function MatchList({ amount, exchangeType, onBack, onSelectMatch }: MatchListProps) {
  // Mock data - would come from API
  const matches: Match[] = [
    {
      id: "1",
      name: "Rahul Sharma",
      trustScore: 4.8,
      location: "Central Library",
      timeAgo: "2 min ago",
      avatar: "RS",
      verified: true,
      completedExchanges: 23
    },
    {
      id: "2", 
      name: "Priya Patel",
      trustScore: 4.9,
      location: "Main Canteen", 
      timeAgo: "5 min ago",
      avatar: "PP",
      verified: true,
      completedExchanges: 41
    },
    {
      id: "3",
      name: "Amit Kumar",
      trustScore: 4.6,
      location: "Computer Lab",
      timeAgo: "8 min ago", 
      avatar: "AK",
      verified: false,
      completedExchanges: 12
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Available Matches</h2>
          <p className="text-muted-foreground">₹{amount} • {matches.length} matches found</p>
        </div>
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <Card key={match.id} className="overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card)] border-2 hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white font-semibold">
                    {match.avatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-foreground">{match.name}</h3>
                    {match.verified && (
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{match.trustScore}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{match.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{match.timeAgo}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={match.verified ? "secondary" : "outline"} className="text-xs">
                      {match.completedExchanges} exchanges
                    </Badge>
                    {match.verified && (
                      <Badge variant="outline" className="text-xs text-secondary border-secondary">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={() => onSelectMatch(match)}
                  className="shadow-[var(--shadow-button)] hover:shadow-lg transition-all duration-300"
                >
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">More matches loading...</p>
      </div>
    </div>
  );
}