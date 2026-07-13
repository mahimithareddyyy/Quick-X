import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, onSnapshot, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { COLLECTIONS } from "@/integrations/firebase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";

type FirestoreUserDoc = {
  uid: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber?: string | null;
};

type ExchangeRequest = {
  id: string;
  money: number;
  status: string;
  location?: string | null;
  createdAt?: any;
  type: "type1" | "type2";
};

const UserProfile = () => {
  const { uid } = useParams();
  const [data, setData] = useState<FirestoreUserDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);

  // Listen to user document
  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const ref = doc(db, COLLECTIONS.USERS, uid);
    const unsub = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        const d = snap.data() as any;
        setData(d as FirestoreUserDoc);
        setUserPhone(d.phoneNumber ?? null);
        setNotFound(false);
      } else {
        const once = await getDoc(ref);
        if (once.exists()) {
          const d = once.data() as any;
          setData(d as FirestoreUserDoc);
          setUserPhone(d.phoneNumber ?? null);
          setNotFound(false);
        } else {
          setData(null);
          setNotFound(true);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  // Fetch phone number from profiles - FIXED: Remove orderBy to avoid index requirement
  useEffect(() => {
    if (!uid) return;
    const fetchPhone = async () => {
      try {
        // Simple query without orderBy to avoid index requirement
        const q = query(collection(db, COLLECTIONS.USERS), where("userId", "==", uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          // Sort in memory if needed
          const docs = snap.docs.sort((a, b) => {
            const timeA = a.data().createdAt?.toDate ? a.data().createdAt.toDate().getTime() : 0;
            const timeB = b.data().createdAt?.toDate ? b.data().createdAt.toDate().getTime() : 0;
            return timeB - timeA;
          });
          setPhoneNumber(docs[0].data().phoneNumber ?? null);
        } else {
          setPhoneNumber(null);
        }
      } catch (error) {
        console.error("Error fetching phone number:", error);
        setPhoneNumber(null);
      }
    };
    fetchPhone();
  }, [uid]);

  // Fetch exchange history - FIXED: Handle queries more safely
  useEffect(() => {
    if (!uid) return;
    setLoadingHistory(true);

    const fetchHistory = async () => {
      try {
        // Fetch type1 requests - use simple query first
        let type1Requests: ExchangeRequest[] = [];
        try {
          const type1Query = query(collection(db, COLLECTIONS.TYPE1_REQUESTS), where("createdBy", "==", uid));
          const type1Snap = await getDocs(type1Query);
          type1Requests = type1Snap.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as any),
            type: "type1"
          }));
        } catch (error) {
          console.error("Error fetching type1 requests:", error);
        }

        // Fetch type2 requests - use simple query first
        let type2Requests: ExchangeRequest[] = [];
        try {
          const type2Query = query(collection(db, COLLECTIONS.TYPE2_REQUESTS), where("createdBy", "==", uid));
          const type2Snap = await getDocs(type2Query);
          type2Requests = type2Snap.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as any),
            type: "type2"
          }));
        } catch (error) {
          console.error("Error fetching type2 requests:", error);
        }

        // Merge and sort in memory
        const allRequests = [...type1Requests, ...type2Requests].sort((a, b) => {
          try {
            const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
            const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
            return timeB - timeA;
          } catch {
            return 0;
          }
        });

        setExchangeHistory(allRequests);
      } catch (error) {
        console.error("Error fetching exchange history:", error);
        setExchangeHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [uid]);

  const formatTime = (value: any) => {
    if (!value) return "";
    try {
      const date = value.toDate ? value.toDate() : new Date(value);
      return date.toLocaleString();
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container max-w-md mx-auto p-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/">
            <img src="/lovable-uploads/058fa7fe-01a6-425a-a726-bce5c262ab90.png" alt="QuickX Logo" className="h-10 w-auto" />
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">Back</Link>
          </Button>
        </div>

        <h1 className="text-xl font-semibold mb-4">User Profile</h1>

        {loading && (
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        )}

        {!loading && notFound && <div className="text-muted-foreground">User not found.</div>}

        {!loading && data && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground mt-4">Name</div>
            <div className="text-base">{[data.firstName, data.lastName].filter(Boolean).join(" ") || "—"}</div>

            <div className="text-sm text-muted-foreground mt-4">Email</div>
            <div className="text-base">{data.email || "—"}</div>

            <div className="text-sm text-muted-foreground mt-4">Mobile number</div>
            <div className="text-base">{userPhone || phoneNumber || "—"}</div>

            <div className="text-sm text-muted-foreground mt-6">Exchange History</div>
            {loadingHistory ? (
              <div className="text-muted-foreground">Loading history...</div>
            ) : exchangeHistory.length === 0 ? (
              <div className="text-muted-foreground">No exchanges found.</div>
            ) : (
              <div className="space-y-2">
                {exchangeHistory.map((req) => (
                  <Card
                  key={req.id}
                  className="transition-shadow hover:shadow-lg border border-gray-200 rounded-xl"
                >
                  <CardContent className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    {/* Left Section: Money and Type */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <div className="text-lg font-semibold">
                        ₹{req.money}{" "}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            req.type === "type1"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {req.type === "type1" ? "Cash" : "UPI"}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground gap-1 mt-1 sm:mt-0">
                        <MapPin className="w-3 h-3" />
                        <span>{req.location || "Unknown location"}</span>
                      </div>
                    </div>
                
                    {/* Right Section: Status and Time */}
                    <div className="flex flex-col items-start sm:items-end gap-1 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          req.status === "active"
                            ? "bg-yellow-100 text-yellow-800"
                            : req.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : req.status === "pending"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatTime(req.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
                 
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;