
import { LampDemo } from '@/components/ui/lamp';
import DecentralizedAppVisual from '@/components/DecentralizedAppVisual';

const Index = () => {
  return (
    <div className="w-full">
      <LampDemo />
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <DecentralizedAppVisual />
      </div>
    </div>
  );
};

export default Index;
