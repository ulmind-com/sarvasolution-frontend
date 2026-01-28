import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { UserPlus } from 'lucide-react';

interface TreeNodeProps {
  user: User | null;
  allUsers: User[];
  level: number;
  maxLevel: number;
}

const TreeNode = ({ user, allUsers, level, maxLevel }: TreeNodeProps) => {
  if (level > maxLevel) return null;

  const leftChild = user?.leftChild ? allUsers.find(u => u.id === user.leftChild) : null;
  const rightChild = user?.rightChild ? allUsers.find(u => u.id === user.rightChild) : null;

  const getRankColor = (rank: string) => {
    const colors: Record<string, string> = {
      'Crown Diamond': 'bg-chart-4 text-foreground',
      'Diamond': 'bg-chart-1 text-primary-foreground',
      'Platinum': 'bg-chart-3 text-primary-foreground',
      'Gold': 'bg-chart-2 text-foreground',
      'Silver': 'bg-muted text-muted-foreground',
      'Bronze': 'bg-secondary text-secondary-foreground',
      'Starter': 'bg-border text-foreground',
    };
    return colors[rank] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      {user ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center cursor-pointer group">
                <Avatar className="h-12 w-12 border-2 border-border group-hover:border-primary transition-colors">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-1 text-center">
                  <p className="text-xs font-medium text-foreground truncate max-w-[80px]">
                    {user.name.split(' ')[0]}
                  </p>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 mt-0.5 ${getRankColor(user.rank)}`}>
                    {user.rank}
                  </Badge>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="p-3">
              <div className="space-y-1">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div className="bg-accent p-1.5 rounded text-center">
                    <p className="text-muted-foreground">Left PV</p>
                    <p className="font-medium text-accent-foreground">{user.leftPV.toLocaleString()}</p>
                  </div>
                  <div className="bg-accent p-1.5 rounded text-center">
                    <p className="text-muted-foreground">Right PV</p>
                    <p className="font-medium text-accent-foreground">{user.rightPV.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="flex flex-col items-center opacity-50">
          <div className="h-12 w-12 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
            <UserPlus className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Empty</p>
        </div>
      )}

      {/* Children */}
      {level < maxLevel && user && (leftChild || rightChild || level < 2) && (
        <div className="relative mt-4">
          {/* Connecting Lines */}
          <div className="absolute top-0 left-1/2 w-px h-4 bg-border -translate-x-1/2" />
          <div className="absolute top-4 left-0 right-0 h-px bg-border" />
          
          <div className="flex gap-8 pt-4">
            <div className="relative">
              <div className="absolute top-0 left-1/2 w-px h-4 bg-border -translate-x-1/2" />
              <div className="pt-4">
                <TreeNode 
                  user={leftChild || null} 
                  allUsers={allUsers} 
                  level={level + 1} 
                  maxLevel={maxLevel}
                />
              </div>
            </div>
            <div className="relative">
              <div className="absolute top-0 left-1/2 w-px h-4 bg-border -translate-x-1/2" />
              <div className="pt-4">
                <TreeNode 
                  user={rightChild || null} 
                  allUsers={allUsers} 
                  level={level + 1} 
                  maxLevel={maxLevel}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Genealogy = () => {
  const { currentUser, allUsers } = useAuth();

  const treeRoot = useMemo(() => {
    return allUsers.find(u => u.id === currentUser?.id) || null;
  }, [currentUser, allUsers]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Genealogy Tree</h1>
        <p className="text-muted-foreground">View your binary network structure</p>
      </div>

      <Card className="border-border overflow-hidden">
        <CardHeader className="border-b border-border bg-card">
          <CardTitle className="text-foreground">Your Network (Binary Tree)</CardTitle>
        </CardHeader>
        <CardContent className="p-8 overflow-x-auto">
          <div className="min-w-[600px] flex justify-center">
            <TreeNode 
              user={treeRoot} 
              allUsers={allUsers} 
              level={0} 
              maxLevel={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Rank Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Crown Diamond', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Starter'].map(rank => (
              <Badge 
                key={rank} 
                variant="outline"
                className={`text-xs ${
                  rank === 'Crown Diamond' ? 'bg-chart-4 text-foreground' :
                  rank === 'Diamond' ? 'bg-chart-1 text-primary-foreground' :
                  rank === 'Platinum' ? 'bg-chart-3 text-primary-foreground' :
                  rank === 'Gold' ? 'bg-chart-2 text-foreground' :
                  rank === 'Silver' ? 'bg-muted text-muted-foreground' :
                  rank === 'Bronze' ? 'bg-secondary text-secondary-foreground' :
                  'bg-border text-foreground'
                }`}
              >
                {rank}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Genealogy;
