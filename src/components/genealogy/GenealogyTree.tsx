import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import TreeNode, { TreeNodeData } from './TreeNode';

interface TreeApiResponse {
  data: TreeNodeData;
}

const fetchTreeData = async (depth: number = 3): Promise<TreeNodeData> => {
  const response = await api.get<TreeApiResponse>(`/api/v1/user/tree_view?depth=${depth}`);
  return response.data.data;
};

const TreeLegend = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="flex flex-wrap gap-3 text-xs"
  >
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-primary/50" />
      <span className="text-muted-foreground">Active</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full border-2 border-dashed border-border bg-muted/30" />
      <span className="text-muted-foreground">Empty</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full bg-chart-4 ring-2 ring-chart-4/50" />
      <span className="text-muted-foreground">Diamond</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full bg-chart-2 ring-2 ring-chart-2/50" />
      <span className="text-muted-foreground">Gold</span>
    </div>
  </motion.div>
);

const TreeSkeleton = () => (
  <div className="flex flex-col items-center py-8">
    <Skeleton className="w-16 h-16 rounded-full" />
    <Skeleton className="w-16 h-3 mt-2 rounded" />
    <Skeleton className="w-12 h-4 mt-1 rounded-full" />
    
    <div className="flex gap-16 mt-10">
      <div className="flex flex-col items-center">
        <Skeleton className="w-14 h-14 rounded-full" />
        <Skeleton className="w-14 h-3 mt-2 rounded" />
      </div>
      <div className="flex flex-col items-center">
        <Skeleton className="w-14 h-14 rounded-full" />
        <Skeleton className="w-14 h-3 mt-2 rounded" />
      </div>
    </div>
  </div>
);

const GenealogyTree = () => {
  const [depth, setDepth] = useState(3);

  const { 
    data: treeData, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching 
  } = useQuery({
    queryKey: ['genealogyTree', depth],
    queryFn: () => fetchTreeData(depth),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Genealogy Tree</h1>
          <p className="text-muted-foreground">View your binary network structure</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="border-border overflow-hidden">
        <CardHeader className="border-b border-border bg-card/50 backdrop-blur-sm flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-foreground">Your Network (Binary Tree)</CardTitle>
          </div>
          <TreeLegend />
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[700px] p-8 flex justify-center">
              {isLoading ? (
                <TreeSkeleton />
              ) : isError ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center py-12 text-center"
                >
                  <div className="p-4 rounded-full bg-destructive/10 mb-4">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Failed to load tree</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                    {(error as Error)?.message || 'Unable to fetch your network data. Please try again.'}
                  </p>
                  <Button onClick={() => refetch()} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </motion.div>
              ) : treeData ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <TreeNode node={treeData} level={0} maxLevel={depth} />
                </motion.div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No network data available
                </div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Depth Control */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">Tree Depth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[2, 3, 4, 5].map((d) => (
              <Button
                key={d}
                variant={depth === d ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDepth(d)}
                className={cn(
                  'min-w-[60px]',
                  depth === d && 'shadow-md shadow-primary/30'
                )}
              >
                {d} Levels
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Higher depth shows more generations but may affect performance
          </p>
        </CardContent>
      </Card>

      {/* Rank Legend */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">Rank Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Crown Diamond', style: 'bg-chart-4 text-foreground' },
              { name: 'Diamond', style: 'bg-chart-1 text-primary-foreground' },
              { name: 'Platinum', style: 'bg-chart-3 text-primary-foreground' },
              { name: 'Gold', style: 'bg-chart-2 text-foreground' },
              { name: 'Silver', style: 'bg-muted text-muted-foreground' },
              { name: 'Bronze', style: 'bg-secondary text-secondary-foreground' },
              { name: 'Associate', style: 'bg-primary text-primary-foreground' },
            ].map((rank) => (
              <Badge
                key={rank.name}
                variant="outline"
                className={cn('text-xs border-0', rank.style)}
              >
                {rank.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenealogyTree;
