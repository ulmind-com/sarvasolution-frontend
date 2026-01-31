import { UserPlus, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
    directSponsors?: number;
    isEmpty?: boolean;
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

// Active node component for D3 tree
interface ActiveD3NodeProps {
  data: D3TreeNodeDatum['attributes'];
  name: string;
  onNodeClick?: (memberId: string) => void;
  hasChildren?: boolean;
}

export const ActiveD3Node = ({ data, name, onNodeClick, hasChildren }: ActiveD3NodeProps) => {
  const { ring, badge, glow } = getRankStyles(data.rank);
  const initials = data.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const avatarUrl = data.profileImage || data.avatar;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={() => onNodeClick?.(data.memberId)}
            className="flex flex-col items-center cursor-pointer group transition-transform duration-200 hover:scale-105"
          >
            {/* Avatar with glow effect */}
            <div className={cn('relative', glow && 'transition-shadow duration-300')}>
              <Avatar
                className={cn(
                  'w-14 h-14 border-2 border-background transition-all duration-300',
                  ring,
                  glow,
                  'group-hover:shadow-xl'
                )}
              >
                <AvatarImage src={avatarUrl} alt={data.fullName} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-xs">
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

            {/* Glassmorphism Info Badge */}
            <div className="mt-1.5 text-center">
              <div className="bg-background/90 backdrop-blur-md border border-border/50 rounded-lg px-2 py-1 shadow-sm">
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
        </TooltipTrigger>
        
        <TooltipContent 
          side="right" 
          className="p-0 overflow-hidden bg-popover/95 backdrop-blur-md border-border/50 shadow-xl rounded-xl max-w-[220px]"
        >
          <div className="p-3 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Avatar className={cn('w-8 h-8', ring)}>
                <AvatarImage src={avatarUrl} alt={data.fullName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground text-xs">{data.fullName}</p>
                <Badge className={cn('text-[9px] mt-0.5', badge)}>{data.rank}</Badge>
              </div>
            </div>
            
            {/* Details Grid */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center py-1 border-b border-border/30">
                <span className="text-muted-foreground">Member ID</span>
                <span className="font-mono font-medium text-foreground">{data.memberId}</span>
              </div>
              
              {data.parentId && (
                <div className="flex justify-between items-center py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Parent ID</span>
                  <span className="font-mono font-medium text-primary">{data.parentId}</span>
                </div>
              )}
              
              {data.position !== 'root' && (
                <div className="flex justify-between items-center py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Position</span>
                  <Badge variant="outline" className="text-[9px] capitalize">
                    {data.position} Leg
                  </Badge>
                </div>
              )}
              
              {data.joiningDate && (
                <div className="flex justify-between items-center py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="font-medium text-foreground">
                    {new Date(data.joiningDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {data.directSponsors !== undefined && (
                <div className="flex justify-between items-center py-1 border-b border-border/30">
                  <span className="text-muted-foreground">Direct Sponsors</span>
                  <span className="font-semibold text-foreground">{data.directSponsors}</span>
                </div>
              )}
              
              {data.totalDownline !== undefined && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Total Downline</span>
                  <span className="font-semibold text-foreground">{data.totalDownline}</span>
                </div>
              )}
            </div>
            
            {/* Click hint */}
            <div className="pt-1.5 border-t border-border/30">
              <p className="text-[9px] text-muted-foreground text-center">
                Click to view this member's network
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
