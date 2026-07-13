import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Star, MapPin, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/integrations/firebase/client";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import UserDetailModal from "./UserDetailModalProps";

interface RealtimeMatchListProps {
  amount: number;
  targetNeedType: "need_cash" | "need_upi";
  myNeedType: "need_cash" | "need_upi";
  location: string;
  onBack: () => void;
  onMatchCreated: (matchId: string) => void;
}

// helper
const getStudentName = (userId: string) => {
  const names = [
    "Rahul Sharma","Priya Patel","Amit Kumar","Sneha Singh","Rohan Gupta",
    "Anjali Verma","Vikash Yadav","Pooja Mishra","Arjun Reddy","Kavya Nair",
    "Siddharth Joshi","Riya Agarwal","Harsh Pandey","Ishita Bhatt","Karan Shah",
    "Neha Kapoor","Aditya Singh","Tanya Sharma","Deepak Kumar","Shreya Jain",
  ];
  const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return names[hash % names.length];
};

const isUserOnline = (userId: string) => userId.charCodeAt(0) % 2 === 0;

export default function RealtimeMatchList({
  amount,
  targetNeedType,
  myNeedType,
  location,
  onBack,
  onMatchCreated,
}: RealtimeMatchListProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // decide which collection to listen to
  const collectionName =
    targetNeedType === "need_upi" ?  "type1Requests": "type2Requests";

	useEffect(() => {
		console.log(`[RealtimeMatchList] Listening on collection: ${collectionName}`);
	  
		const q = query(
		  collection(db, collectionName),
		  where("status", "==", "active")
		);
	  
		const unsub = onSnapshot(
		  q,
		  async (snap) => {
			if (snap.empty) {
			  setRequests([]);
			  setLoading(false);
			  return;
			}
	  
			try {
			  // Fetch user details for each request
			  const data = await Promise.all(
				snap.docs.map(async (docSnap) => {
				  const req = { id: docSnap.id, ...docSnap.data() } as any;
	  
				  // 🚫 Skip self requests
				  if (req.createdBy === user?.uid) {
					return null;
				  }
	  
				  let userData: any = null;
				  if (req.receiverId) {
					try {
					  const userRef = doc(db, "users", req.receiverId);
					  const userSnap = await getDoc(userRef);
					  if (userSnap.exists()) {
						userData = userSnap.data();
					  } else {
						console.warn("[RealtimeMatchList] ⚠️ User not found:", req.receiverId);
					  }
					} catch (err) {
					  console.error("[RealtimeMatchList] ❌ Error fetching user:", req.receiverId, err);
					}
				  }
	  
				  return { ...req, user: userData };
				})
			  );
	  
			  // Filter out nulls (self-requests skipped above)
			  setRequests(data.filter(Boolean));
			} catch (err) {
			  console.error("[RealtimeMatchList] ❌ Error mapping requests:", err);
			} finally {
			  setLoading(false);
			}
		  },
		  (error) => {
			console.error("[RealtimeMatchList] Snapshot error:", error);
			setLoading(false);
		  }
		);
	  
		return () => {
		  console.log("[RealtimeMatchList] 🔴 Unsubscribing from snapshot");
		  unsub();
		};
	  }, [targetNeedType, user?.uid]);
	  
	  

  const handleConnect = async (requestId: string) => {
    setConnecting(requestId);

    // later: write to Matches collection
    setTimeout(() => {
      toast({
        title: "Match Request Sent!",
        description: "Waiting for the other user to accept.",
      });
      onMatchCreated(requestId);
      setConnecting(null);
    }, 1500);
  };

  const formatTime = (value: any): string => {
    try {
      const d = value?.toDate ? value.toDate() : new Date(value);
      if (!isNaN(d.getTime())) return d.toLocaleTimeString();
      return "";
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold">Finding Matches...</h2>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
              <div className="w-20 h-10 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

return (
  <div className="space-y-6 max-w-4xl mx-auto p-4">
    {/* Header Section */}
    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <Button variant="ghost" size="icon" onClick={onBack} className="self-start">
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <div className="flex-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
          Live Exchange Partners
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
          <span className="text-lg font-semibold text-primary">₹{amount}</span>
          <span>•</span>
          <span className="text-sm sm:text-base">
            Looking for{" "}
            {targetNeedType === "need_cash" ? "Cash Providers" : "UPI Providers"}
          </span>
        </div>
      </div>
    </div>

    {/* Content Section */}
    {requests.length === 0 ? (
      <Card className="border-dashed border-2">
        <CardContent className="p-8 sm:p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">
              Searching for Exchange Partners
            </h3>
            <p className="text-muted-foreground">
              Looking for {targetNeedType === "need_cash" ? "cash holders" : "UPI holders"} in your area
            </p>
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-2 h-2 bg-primary rounded-full animation-delay-200"></div>
                <div className="w-2 h-2 bg-primary rounded-full animation-delay-400"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ) : (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Found {requests.length} available partner{requests.length !== 1 ? 's' : ''}
        </div>
        
        {requests.map((req) => (
          <Card key={req.id} className="transition-all duration-200 hover:shadow-lg hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center space-x-4 flex-shrink-0">
                  <Avatar className="w-14 h-14 ring-2 ring-background shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold text-lg">
                      {req.user?.firstName
                        ? req.user.firstName.charAt(0) + (req.user.lastName?.charAt(0) || "")
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">
                        {req.user?.firstName
                          ? `${req.user.firstName} ${req.user.lastName || ""}`
                          : getStudentName(req.createdBy)}
                      </h3>
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-sm">4.8</span>
                      <span className="text-xs text-muted-foreground">(24 reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default" className="text-base font-semibold px-3 py-1">
                      ₹{req.money}
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      {targetNeedType === "need_cash" ? "💵 Has Cash" : "📱 Has UPI"}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{req.location || "Unknown location"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{formatTime(req.createdAt)}</span>
                    </div>
                  </div>

                  {/* Additional Info Row */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>✓ Verified Student</span>
                    <span>⚡ Quick Response</span>
                    <span>🛡️ Safe Exchange</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0 pt-2 lg:pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(req);
                    setShowUserModal(true);
                  }}
                >
                  View Details
                </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Load More Button */}
        {requests.length >= 5 && (
          <div className="text-center pt-4">
            <Button variant="outline" className="min-w-[140px]">
              Load More Partners
            </Button>
          </div>
        )}
      </div>
    )}
    {selectedUser && (
  <UserDetailModal
    req={selectedUser}
    open={showUserModal}
    onClose={() => setShowUserModal(false)}
  />
)}

  </div>
);
}
