import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TreeNodeData {
  memberId: string;
  fullName: string;
  rank: string;
  position: 'root' | 'left' | 'right';
  avatar?: string;
  joiningDate?: string;
  totalDownline?: number;
  left: TreeNodeData | null;
  right: TreeNodeData | null;
}

interface TreeNodeProps {
  node: TreeNodeData | null;
  level: number;
  maxLevel?: number;
}

const getRankStyles = (rank: string): { ring: string; badge: string } => {
  const rankLower = rank?.toLowerCase() || '';
  
  if (rankLower.includes('crown') || rankLower.includes('diamond')) {
    return { 
      ring: 'ring-4 ring-chart-4/60 shadow-lg shadow-chart-4/30', 
      badge: 'bg-chart-4 text-foreground' 
    };
  }
  if (rankLower.includes('platinum')) {
    return { 
      ring: 'ring-4 ring-chart-3/60 shadow-lg shadow-chart-3/30', 
      badge: 'bg-chart-3 text-primary-foreground' 
    };
  }
  if (rankLower.includes('gold')) {
    return { 
      ring: 'ring-4 ring-chart-2/60 shadow-lg shadow-chart-2/30', 
      badge: 'bg-chart-2 text-foreground' 
    };
  }
  if (rankLower.includes('silver')) {
    return { 
      ring: 'ring-2 ring-muted-foreground/40', 
      badge: 'bg-muted text-muted-foreground' 
    };
  }
  if (rankLower.includes('bronze')) {
    return { 
      ring: 'ring-2 ring-secondary/60', 
      badge: 'bg-secondary text-secondary-foreground' 
    };
  }
  // Default for Associate, Starter, etc.
  return { 
    ring: 'ring-2 ring-primary/50 shadow-md shadow-primary/20', 
    badge: 'bg-primary text-primary-foreground' 
  };
};

const EmptyNode = () => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3, type: 'spring' }}
    className="flex flex-col items-center"
  >
    <div className="w-14 h-14 rounded-full border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center cursor-default opacity-60 hover:opacity-80 transition-opacity">
      <UserPlus className="h-5 w-5 text-muted-foreground/60" />
    </div>
    <span className="text-[10px] text-muted-foreground/60 mt-1">Empty</span>
  </motion.div>
);

const NodeCard = ({ data }: { data: TreeNodeData }) => {
  const { ring, badge } = getRankStyles(data.rank);
  const initials = data.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
            whileHover={{ scale: 1.1 }}
            className="flex flex-col items-center cursor-pointer group"
          >
            <Avatar
              className={cn(
                'w-16 h-16 border-2 border-background transition-all duration-200',
                ring
              )}
            >
              <AvatarImage src={data.avatar} alt={data.fullName} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="mt-1.5 text-center max-w-[80px]">
              <p className="text-xs font-medium text-foreground truncate">
                {data.fullName.split(' ')[0]}
              </p>
              <Badge
                variant="outline"
                className={cn('text-[9px] px-1.5 py-0 mt-0.5 border-0', badge)}
              >
                {data.rank}
              </Badge>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="p-4 max-w-[220px] bg-popover/95 backdrop-blur-sm border-border/50"
        >
          <div className="space-y-2">
            <div>
              <p className="font-semibold text-foreground">{data.fullName}</p>
              <p className="text-xs text-muted-foreground font-mono">
                ID: {data.memberId}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={cn('text-xs', badge)}>{data.rank}</Badge>
              {data.position !== 'root' && (
                <Badge variant="outline" className="text-xs capitalize">
                  {data.position} Leg
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
              {data.joiningDate && (
                <div className="bg-accent/50 p-2 rounded text-center">
                  <p className="text-[10px] text-muted-foreground">Joined</p>
                  <p className="text-xs font-medium text-accent-foreground">
                    {new Date(data.joiningDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {data.totalDownline !== undefined && (
                <div className="bg-accent/50 p-2 rounded text-center">
                  <p className="text-[10px] text-muted-foreground">Downline</p>
                  <p className="text-xs font-medium text-accent-foreground">
                    {data.totalDownline}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const TreeNode = ({ node, level, maxLevel = 3 }: TreeNodeProps) => {
  if (level > maxLevel) return null;

  if (!node) {
    return <EmptyNode />;
  }

  const hasChildren = node.left !== null || node.right !== null;
  const showChildren = level < maxLevel;

  return (
    <div className="flex flex-col items-center">
      <NodeCard data={node} />

      {showChildren && (
        <div className="relative mt-6">
          {/* Vertical line from parent */}
          <div className="absolute top-0 left-1/2 w-px h-6 bg-border -translate-x-1/2 -translate-y-6" />
          
          {/* Horizontal connector line */}
          <div className="absolute -top-0 left-[25%] right-[25%] h-px bg-border" />

          {/* Children container */}
          <div className="flex gap-12 lg:gap-16">
            {/* Left child */}
            <div className="relative flex flex-col items-center">
              {/* Branch line down to left child */}
              <div className="absolute top-0 left-1/2 w-px h-4 bg-border -translate-x-1/2 -translate-y-4" />
              <TreeNode node={node.left} level={level + 1} maxLevel={maxLevel} />
            </div>

            {/* Right child */}
            <div className="relative flex flex-col items-center">
              {/* Branch line down to right child */}
              <div className="absolute top-0 left-1/2 w-px h-4 bg-border -translate-x-1/2 -translate-y-4" />
              <TreeNode node={node.right} level={level + 1} maxLevel={maxLevel} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeNode;
