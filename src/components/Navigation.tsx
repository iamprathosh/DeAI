import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Home, Network, Database, HelpCircle, Star } from 'lucide-react';

const routes: Record<string, { label: string; icon: React.ReactNode }> = {
  '': { label: 'Home', icon: <Home className="h-4 w-4" /> },
  'network': { label: 'Network Monitor', icon: <Network className="h-4 w-4" /> },
  'storage': { label: 'Storage Explorer', icon: <Database className="h-4 w-4" /> },
  'about': { label: 'About', icon: <HelpCircle className="h-4 w-4" /> },
  'gemini': { label: 'Gemini', icon: <Star className="h-4 w-4" /> },
};

const Navigation = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { path: '/', label: 'Home', icon: <Home className="h-4 w-4" /> }
    ];
    
    let currentPath = '';
    
    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      
      breadcrumbs.push({
        path: currentPath,
        label: routes[segment]?.label || segment.charAt(0).toUpperCase() + segment.slice(1),
        icon: routes[segment]?.icon || null
      });
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  return (
    <div className="py-2 px-4 bg-white bg-opacity-90 backdrop-blur-sm border-b border-slate-200">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <BreadcrumbItem className="flex items-center">
                {index < breadcrumbs.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path} className="flex items-center gap-1 text-slate-600 hover:text-accent-blue">
                      {crumb.icon && <span>{crumb.icon}</span>}
                      <span>{crumb.label}</span>
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="flex items-center gap-1 text-slate-900">
                    {crumb.icon && <span>{crumb.icon}</span>}
                    <span>{crumb.label}</span>
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default Navigation;
