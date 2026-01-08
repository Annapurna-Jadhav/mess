import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const LeftHero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      {/* Tag */}
      <span
        className="
          inline-flex items-center
          px-4 py-1.5
          text-xs font-medium
          rounded-full
          bg-[#6770d2]/10
          text-[#6770d2]
        "
      >
        NITK Smart Mess Card System
      </span>


      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
        Smart Mess Card
      </h1>


      <h2 className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
        Digital Mess Card • Centralized Records • Role-Based Access
      </h2>

     
      {!user && (
        <Button
          size="lg"
          onClick={() => navigate("/login")}
          className="
            bg-[#6770d2]
            hover:bg-[#5b63c7]
            shadow-lg
            px-8
          "
        >
          Continue to Smart Mess
        </Button>
      )}
    </div>
  );
};

export default LeftHero;
