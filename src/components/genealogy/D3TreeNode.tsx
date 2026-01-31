import { useState } from 'react';
import { UserPlus, ChevronDown, User, MapPin, Calendar, Users, Award, CheckCircle2, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TreeNodeData } from './TreeNode';

// D3 Tree Node Datum format
export interface D3TreeNodeDatum {
  name: string;
  attributes: {
    memberId: string;
    fullName: string;
    rank: string;
    position: 'root' | 'left' | 'right';
    avatar?: string;
    profileImage?: string;
    joiningDate?: string;
    totalDownline?: number;
    parentId?: string;
    sponsorId?: string;
    directSponsors?: number;
    isEmpty?: boolean;
    isActive?: boolean;
    status?: string;
    // Direct Business Stats
    leftDirectActive?: number;
    leftDirectInactive?: number;
    rightDirectActive?: number;
    rightDirectInactive?: number;
  };
  children?: D3TreeNodeDatum[];
}

// Transform API data to D3 tree format
export const transformToD3Format = (node: TreeNodeData | null, position: 'root' | 'left' | 'right' = 'root'): D3TreeNodeDatum => {
  if (!node) {
    return {
      name: 'Empty',
      attributes: {
        memberId: '',
        fullName: 'Empty Slot',
        rank: '',
        position,
        isEmpty: true,
      },
    };
  }

  const children: D3TreeNodeDatum[] = [];
  
  // Always add both children for binary structure (even if null)
  if (node.left !== null || node.right !== null) {
    children.push(transformToD3Format(node.left, 'left'));
    children.push(transformToD3Format(node.right, 'right'));
  }

  return {
    name: node.fullName,
    attributes: {
      memberId: node.memberId,
      fullName: node.fullName,
      rank: node.rank,
      position: node.position || position,
      avatar: node.avatar,
      profileImage: node.profileImage,
      joiningDate: node.joiningDate,
      totalDownline: node.totalDownline,
      parentId: node.parentId,
      sponsorId: node.sponsorId,
      directSponsors: node.directSponsors,
      isEmpty: false,
      isActive: node.isActive ?? (node.status?.toLowerCase() === 'active'),
      status: node.status,
      // Direct Business Stats
      leftDirectActive: node.leftDirectActive ?? 0,
      leftDirectInactive: node.leftDirectInactive ?? 0,
      rightDirectActive: node.rightDirectActive ?? 0,
      rightDirectInactive: node.rightDirectInactive ?? 0,
    },
    children: children.length > 0 ? children : undefined,
  };
};

const getRankStyles = (rank: string): { ring: string; badge: string; glow: string } => {
  const rankLower = rank?.toLowerCase() || '';
  
  if (rankLower.includes('crown')) {
    return { 
      ring: 'ring-4 ring-chart-4', 
      badge: 'bg-chart-4 text-foreground',
      glow: 'shadow-[0_0_20px_rgba(var(--chart-4),0.4)]'
    };
  }
  if (rankLower.includes('diamond')) {
    return { 
      ring: 'ring-4 ring-chart-1', 
      badge: 'bg-chart-1 text-primary-foreground',
      glow: 'shadow-[0_0_20px_rgba(var(--chart-1),0.4)]'
    };
  }
  if (rankLower.includes('platinum')) {
    return { 
      ring: 'ring-4 ring-chart-3', 
      badge: 'bg-chart-3 text-primary-foreground',
      glow: 'shadow-[0_0_15px_rgba(var(--chart-3),0.3)]'
    };
  }
  if (rankLower.includes('gold')) {
    return { 
      ring: 'ring-4 ring-chart-2', 
      badge: 'bg-chart-2 text-foreground',
      glow: 'shadow-[0_0_15px_rgba(var(--chart-2),0.3)]'
    };
  }
  if (rankLower.includes('silver')) {
    return { 
      ring: 'ring-3 ring-muted-foreground/50', 
      badge: 'bg-muted text-muted-foreground',
      glow: ''
    };
  }
  if (rankLower.includes('bronze')) {
    return { 
      ring: 'ring-3 ring-secondary', 
      badge: 'bg-secondary text-secondary-foreground',
      glow: ''
    };
  }
  return { 
    ring: 'ring-3 ring-primary', 
    badge: 'bg-primary text-primary-foreground',
    glow: 'shadow-[0_0_12px_rgba(var(--primary),0.25)]'
  };
};

// Empty node component for D3 tree
export const EmptyD3Node = () => (
  <div className="flex flex-col items-center">
    <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/40 bg-muted/30 flex items-center justify-center opacity-60">
      <UserPlus className="h-4 w-4 text-muted-foreground/50" />
    </div>
    <span className="text-[10px] text-muted-foreground/50 mt-1 font-medium">Empty</span>
  </div>
);

// Custom Hover Tooltip (works inside SVG foreignObject)
const HoverTooltip = ({ 
  data, 
  name, 
  isVisible 
}: { 
  data: D3TreeNodeDatum['attributes']; 
  name: string; 
  isVisible: boolean;
}) => {
  const { ring, badge } = getRankStyles(data.rank);
  const initials = data.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  const avatarUrl = data.profileImage || data.avatar;
  const isActive = data.isActive ?? (data.status?.toLowerCase() === 'active');

  // Format joining date
  const formattedJoiningDate = data.joiningDate 
    ? new Date(data.joiningDate).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    : null;

  // Get sponsor display value
  const sponsorDisplay = data.sponsorId || data.parentId || 'N/A';

  if (!isVisible) return null;

  return (
    <div 
      className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200"
      style={{ minWidth: '260px' }}
    >
      <div className="bg-popover/98 backdrop-blur-lg border border-border shadow-2xl rounded-xl overflow-hidden">
        {/* Section A: Identity Header */}
        <div className="bg-gradient-to-r from-primary/10 to-transparent p-3 border-b border-border/50 relative">
          {/* Status Badge - Top Right */}
          <Badge 
            className={cn(
              'absolute top-2 right-2 text-[9px] px-1.5 py-0.5',
              isActive 
                ? 'bg-chart-2/20 text-chart-2 border-chart-2/30' 
                : 'bg-destructive/20 text-destructive border-destructive/30'
            )}
            variant="outline"
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>

          <div className="flex items-center gap-3">
            <Avatar className={cn('w-12 h-12', ring)}>
              <AvatarImage src={avatarUrl} alt={data.fullName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="pr-16">
              <p className="font-bold text-foreground text-sm">{name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{data.memberId}</p>
            </div>
          </div>
        </div>

        {/* Section B: Core Info - 2x2 Grid */}
        <div className="p-3 grid grid-cols-2 gap-2 text-xs border-b border-border/50">
          <div className="flex flex-col gap-0.5 p-2 bg-muted/30 rounded-lg">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Sponsor</span>
            <span className="font-mono font-semibold text-primary truncate">{sponsorDisplay}</span>
          </div>
          
          <div className="flex flex-col gap-0.5 p-2 bg-muted/30 rounded-lg">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Joined</span>
            <span className="font-medium text-foreground">{formattedJoiningDate || 'N/A'}</span>
          </div>
          
          <div className="flex flex-col gap-0.5 p-2 bg-muted/30 rounded-lg">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Rank</span>
            <Badge className={cn('text-[9px] w-fit', badge)}>{data.rank || 'N/A'}</Badge>
          </div>
          
          <div className="flex flex-col gap-0.5 p-2 bg-muted/30 rounded-lg">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Position</span>
            <Badge variant="outline" className="text-[9px] capitalize w-fit font-medium">
              {data.position === 'root' ? 'Root' : `${data.position} Leg`}
            </Badge>
          </div>
        </div>

        {/* Section C: Direct Business Stats */}
        <div className="p-3 bg-muted/40">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Direct Business
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Left Leg Stats */}
            <div className="p-2 bg-background/60 rounded-lg border border-border/30">
              <p className="text-[10px] font-medium text-muted-foreground mb-1.5 text-center">Left Leg</p>
              <div className="flex justify-center gap-3">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-chart-2" />
                  <span className="text-xs font-bold text-chart-2">{data.leftDirectActive ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-destructive" />
                  <span className="text-xs font-bold text-destructive">{data.leftDirectInactive ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Right Leg Stats */}
            <div className="p-2 bg-background/60 rounded-lg border border-border/30">
              <p className="text-[10px] font-medium text-muted-foreground mb-1.5 text-center">Right Leg</p>
              <div className="flex justify-center gap-3">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-chart-2" />
                  <span className="text-xs font-bold text-chart-2">{data.rightDirectActive ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-destructive" />
                  <span className="text-xs font-bold text-destructive">{data.rightDirectInactive ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-3 py-2 bg-muted/20 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground text-center">
            Click to view this member's network
          </p>
        </div>
      </div>

      {/* Arrow pointer */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-3 h-3 bg-popover border-l border-b border-border rotate-45" />
    </div>
  );
};

interface ActiveD3NodeProps {
  data: D3TreeNodeDatum['attributes'];
  name: string;
  onNodeClick?: (memberId: string) => void;
  hasChildren?: boolean;
  isHighlighted?: boolean;
}

export const ActiveD3Node = ({ data, name, onNodeClick, hasChildren, isHighlighted }: ActiveD3NodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { badge } = getRankStyles(data.rank);
  const initials = data.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const avatarUrl = data.profileImage || data.avatar;
  
  // Determine active/inactive status
  const isActive = data.isActive ?? (data.status?.toLowerCase() === 'active');

  // Status-based styles - INTENSE Neon glow for instant visual assessment
  const statusStyles = isActive
    ? {
        border: 'border-chart-2',
        ring: 'ring-2 ring-chart-2/70',
        shadow: 'shadow-[0_0_25px_rgba(34,197,94,0.9)]', // Strong green glow
      }
    : {
        border: 'border-destructive',
        ring: 'ring-2 ring-destructive/70',
        shadow: 'shadow-[0_0_25px_rgba(239,68,68,0.9)]', // Strong red glow
      };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={() => onNodeClick?.(data.memberId)}
        className={cn(
          'flex flex-col items-center cursor-pointer group transition-all duration-300',
          isHighlighted 
            ? 'scale-110 z-50' 
            : 'hover:scale-105'
        )}
      >
        {/* Highlight glow effect for search */}
        {isHighlighted && (
          <div 
            className="absolute -inset-3 rounded-2xl animate-pulse pointer-events-none"
            style={{ 
              background: 'linear-gradient(135deg, rgba(250,204,21,0.4), rgba(234,179,8,0.3))',
              boxShadow: '0 0 30px rgba(250,204,21,0.6), 0 0 60px rgba(250,204,21,0.3)',
              zIndex: -1
            }} 
          />
        )}
        
        {/* Avatar with status-based STRONG glow effect */}
        <div className="relative transition-shadow duration-300">
          <Avatar
            className={cn(
              'w-16 h-16 border-4 transition-all duration-300 bg-background',
              isHighlighted 
                ? 'border-yellow-400 ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.9)]' 
                : cn(
                    statusStyles.border,
                    statusStyles.ring,
                    statusStyles.shadow,
                    'group-hover:scale-105'
                  )
            )}
          >
            <AvatarImage src={avatarUrl} alt={data.fullName} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Drill-down indicator */}
          {hasChildren && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Name Label - FIXED: Dark text on light background for readability */}
        <div className="mt-2.5 text-center">
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full px-3 py-1 shadow-md">
            <p className="text-[12px] font-extrabold text-foreground tracking-wide truncate max-w-[90px]">
              {name.split(' ')[0]}
            </p>
          </div>
          
          {/* Member ID */}
          <p className="mt-1 text-[9px] font-bold text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full">
            {data.memberId}
          </p>
          
          {/* Rank Badge */}
          <Badge
            variant="outline"
            className={cn('text-[8px] px-1.5 py-0 mt-0.5 border-0 shadow-sm', badge)}
          >
            {data.rank}
          </Badge>
        </div>
      </div>

      {/* Custom Hover Tooltip */}
      <HoverTooltip data={data} name={name} isVisible={isHovered} />
    </div>
  );
};
