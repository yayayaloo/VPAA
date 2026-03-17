import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        
        try {
      
          const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().is_first_login === true) {
            setIsFirstLogin(true);
          } else {
            setIsFirstLogin(false);
          }
        } catch (error) {
          console.error("Error checking user status:", error);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }


  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }


  if (isFirstLogin) {
    return <Navigate to="/set-password" replace />;
  }

 
  return <>{children}</>;
};

export default ProtectedRoute;