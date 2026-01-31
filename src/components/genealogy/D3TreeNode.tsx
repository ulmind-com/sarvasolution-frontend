import { UserPlus, ChevronDown, User, MapPin, Calendar, Users, Award, CheckCircle2, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
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
    directSponsors?: number;
    isEmpty?: boolean;
    // New fields for status and team stats
    sponsorId?: string;
    status?: 'active' | 'inactive';
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
      directSponsors: node.directSponsors,
      isEmpty: false,
      // New fields for status and team stats
      sponsorId: node.sponsorId,
      status: node.status,
      leftDirectActive: node.leftDirectActive,
      leftDirectInactive: node.leftDirectInactive,
      rightDirectActive: node.rightDirectActive,
      rightDirectInactive: node.rightDirectInactive,
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

// Tooltip Content component for HoverCard - rendered via Portal
const TooltipContent = ({ 
  data, 
  name 
}: { 
  data: D3TreeNodeDatum['attributes']; 
  name: string; 
}) => {
  const { ring, badge } = getRankStyles(data.rank);
  const initials = data.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  const avatarUrl = data.profileImage || data.avatar;
  const isInactive = data.status?.toLowerCase() === 'inactive';

  return (
    <div className="bg-slate-900 backdrop-blur-lg border border-slate-700 shadow-2xl rounded-xl overflow-hidden text-slate-100 min-w-[260px]">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-3 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Avatar className={cn('w-10 h-10', ring)}>
            <AvatarImage src={avatarUrl} alt={data.fullName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-bold text-slate-50 text-sm">{name}</p>
            <p className="text-[10px] text-slate-400 font-mono">{data.memberId}</p>
          </div>
          {/* Status Badge */}
          <Badge 
            className={cn(
              'text-[9px] px-2 py-0.5',
              isInactive 
                ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                : 'bg-green-500/20 text-green-400 border-green-500/30'
            )}
            variant="outline"
          >
            {isInactive ? 'Inactive' : 'Active'}
          </Badge>
        </div>
      </div>

      {/* Details Grid */}
      <div className="p-3 space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-2 py-1 border-b border-slate-700/50">
            <User className="h-3.5 w-3.5 text-primary" />
            <span className="text-slate-400">Sponsor</span>
          </div>
          <div className="py-1 border-b border-slate-700/50 text-right">
            <span className="font-mono font-semibold text-slate-200">{data.sponsorId || data.parentId || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2 py-1 border-b border-slate-700/50">
            <Calendar className="h-3.5 w-3.5 text-chart-1" />
            <span className="text-slate-400">Joined</span>
          </div>
          <div className="py-1 border-b border-slate-700/50 text-right">
            <span className="font-medium text-slate-200">
              {data.joiningDate ? new Date(data.joiningDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-2 py-1 border-b border-slate-700/50">
            <Award className="h-3.5 w-3.5 text-chart-4" />
            <span className="text-slate-400">Rank</span>
          </div>
          <div className="py-1 border-b border-slate-700/50 text-right">
            <Badge className={cn('text-[9px] px-1.5', badge)}>{data.rank}</Badge>
          </div>

          <div className="flex items-center gap-2 py-1 border-b border-slate-700/50">
            <MapPin className="h-3.5 w-3.5 text-chart-3" />
            <span className="text-slate-400">Position</span>
          </div>
          <div className="py-1 border-b border-slate-700/50 text-right">
            <Badge variant="outline" className="text-[9px] capitalize font-medium border-slate-600 text-slate-300">
              {data.position === 'root' ? 'Root' : `${data.position} Leg`}
            </Badge>
          </div>
        </div>

        {/* Team Stats Section */}
        <div className="pt-2 mt-2 border-t border-slate-700">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Direct Business</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Left Leg Stats */}
            <div className="bg-slate-800/50 rounded-lg p-2">
              <p className="text-[10px] font-medium text-slate-300 mb-1.5">Left Leg</p>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-green-400 font-semibold">{data.leftDirectActive ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-red-400 font-semibold">{data.leftDirectInactive ?? 0}</span>
                </div>
              </div>
            </div>
            
            {/* Right Leg Stats */}
            <div className="bg-slate-800/50 rounded-lg p-2">
              <p className="text-[10px] font-medium text-slate-300 mb-1.5">Right Leg</p>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-green-400 font-semibold">{data.rightDirectActive ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-red-400 font-semibold">{data.rightDirectInactive ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Downline */}
        {data.totalDownline !== undefined && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-chart-2" />
              <span className="text-slate-400">Total Downline</span>
            </div>
            <span className="font-bold text-slate-100">{data.totalDownline}</span>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 bg-slate-800/50 border-t border-slate-700">
        <p className="text-[10px] text-slate-500 text-center">
          Click to view this member's network
        </p>
      </div>
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
  const { ring, badge, glow } = getRankStyles(data.rank);
  const initials = data.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const avatarUrl = data.profileImage || data.avatar;
  
  // Determine status-based styling - strict Green vs Red
  const isInactive = data.status?.toLowerCase() === 'inactive';
  const statusBorderColor = isInactive ? 'border-red-500' : 'border-green-500';
  const statusShadow = isInactive 
    ? 'shadow-[0_0_12px_rgba(239,68,68,0.5)]' 
    : 'shadow-[0_0_12px_rgba(34,197,94,0.5)]';

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
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
          
          {/* Avatar with status-based glow effect */}
          <div className={cn('relative', 'transition-shadow duration-300')}>
            <Avatar
              className={cn(
                'w-14 h-14 border-2 transition-all duration-300',
                isHighlighted 
                  ? 'border-yellow-400 ring-4 ring-yellow-400' 
                  : cn('border-background', ring),
                isHighlighted 
                  ? 'shadow-[0_0_25px_rgba(250,204,21,0.7)]' 
                  : cn(statusShadow, 'group-hover:shadow-xl')
              )}
            >
              <AvatarImage src={avatarUrl} alt={data.fullName} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            {/* Status indicator dot - strict Green vs Red */}
            <div 
              className={cn(
                'absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background',
                isInactive ? 'bg-red-500' : 'bg-green-500'
              )}
            />
            
            {/* Drill-down indicator */}
            {hasChildren && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Glassmorphism Info Badge with status border */}
          <div className="mt-1.5 text-center">
            <div className={cn(
              'backdrop-blur-md border-2 rounded-lg px-2 py-1 shadow-sm transition-all duration-300',
              isHighlighted 
                ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-300' 
                : cn('bg-background/90', statusBorderColor)
            )}>
              <p className="text-[11px] font-semibold text-foreground truncate max-w-[80px]">
                {name.split(' ')[0]}
              </p>
              <p className="text-[9px] text-muted-foreground font-mono">
                {data.memberId}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn('text-[8px] px-1.5 py-0 mt-0.5 border-0 shadow-sm', badge)}
            >
              {data.rank}
            </Badge>
          </div>
        </div>
      </HoverCardTrigger>

      {/* HoverCardContent renders via Portal - floats above SVG stacking context */}
      <HoverCardContent 
        side="top" 
        sideOffset={12} 
        collisionPadding={16}
        className="p-0 border-0 bg-transparent shadow-none z-[9999] w-auto"
      >
        <TooltipContent data={data} name={name} />
      </HoverCardContent>
    </HoverCard>
  );
};
