import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, ChevronLeft, ChevronRight, UserX } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface TeamMember {
  _id: string;
  memberId: string;
  fullName: string;
  email: string;
  currentRank: string;
  totalBV: number;
  status: string;
  joiningDate?: string;
  profilePicture?: {
    url: string;
  };
}

interface PaginationData {
  page: number;
  pages: number;
  total: number;
  limit: number;
}

interface DirectTeamResponse {
  success: boolean;
  data: {
    team: TeamMember[];
    pagination: PaginationData;
  };
}

const rankColors: Record<string, string> = {
  starter: 'bg-muted text-muted-foreground',
  associate: 'bg-chart-2/20 text-chart-2',
  bronze: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  silver: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  platinum: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  diamond: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const DirectTeam = () => {
  const [activeLeg, setActiveLeg] = useState<'left' | 'right'>('left');
  const [data, setData] = useState<TeamMember[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDirectTeam = async (page: number, leg: 'left' | 'right') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<DirectTeamResponse>('/api/v1/user/direct-team', {
        params: { page, limit: 10, leg }
      });
      
      if (response.data.success) {
        setData(response.data.data.team || []);
        setPagination(response.data.data.pagination);
      }
    } catch (err: any) {
      console.error('Failed to fetch direct team:', err);
      setError(err.response?.data?.message || 'Failed to load team data');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchDirectTeam(1, activeLeg);
  }, [activeLeg]);

  useEffect(() => {
    fetchDirectTeam(currentPage, activeLeg);
  }, [currentPage]);

  const handleTabChange = (value: string) => {
    setActiveLeg(value as 'left' | 'right');
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (pagination && currentPage < pagination.pages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankBadgeClass = (rank: string) => {
    const normalizedRank = rank?.toLowerCase() || 'starter';
    return rankColors[normalizedRank] || rankColors.starter;
  };

  const renderTableContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        </TableRow>
      ));
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-10">
            <p className="text-destructive">{error}</p>
          </TableCell>
        </TableRow>
      );
    }

    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-muted">
                <UserX className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">No members found</p>
                <p className="text-sm text-muted-foreground">
                  No members in your {activeLeg === 'left' ? 'Left' : 'Right'} Leg yet
                </p>
              </div>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return data.map((member) => (
      <TableRow key={member._id} className="hover:bg-muted/50">
        {/* Member Profile */}
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-border">
              <AvatarImage 
                src={member.profilePicture?.url} 
                alt={member.fullName} 
                className="object-cover"
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {getInitials(member.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{member.fullName}</p>
              <p className="text-xs text-muted-foreground font-mono">{member.memberId}</p>
            </div>
          </div>
        </TableCell>

        {/* Rank */}
        <TableCell>
          <Badge className={cn('capitalize', getRankBadgeClass(member.currentRank))}>
            {member.currentRank || 'Starter'}
          </Badge>
        </TableCell>

        {/* Business Volume */}
        <TableCell>
          <span className="font-semibold text-foreground">
            {(member.totalBV || 0).toLocaleString()} BV
          </span>
        </TableCell>

        {/* Status */}
        <TableCell>
          <div className="flex items-center gap-2">
            <span 
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                member.status?.toLowerCase() === 'active' 
                  ? 'bg-chart-2' 
                  : 'bg-destructive'
              )} 
            />
            <span className={cn(
              'text-sm font-medium capitalize',
              member.status?.toLowerCase() === 'active' 
                ? 'text-chart-2' 
                : 'text-destructive'
            )}>
              {member.status || 'Inactive'}
            </span>
          </div>
        </TableCell>

        {/* Joining Date */}
        <TableCell>
          <span className="text-muted-foreground">
            {member.joiningDate 
              ? format(new Date(member.joiningDate), 'dd MMM yyyy')
              : '—'
            }
          </span>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            My Direct Team
          </h1>
          <p className="text-muted-foreground mt-1">
            Total Directs: <span className="font-semibold text-foreground">{pagination?.total || 0}</span>
          </p>
        </div>
      </div>

      {/* Tabs & Table Card */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <Tabs value={activeLeg} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full max-w-xs grid-cols-2 bg-muted">
              <TabsTrigger 
                value="left" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Left Leg
              </TabsTrigger>
              <TabsTrigger 
                value="right"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Right Leg
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {/* Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Member</TableHead>
                  <TableHead className="font-semibold">Rank</TableHead>
                  <TableHead className="font-semibold">Business Volume</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTableContent()}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNext}
                  disabled={currentPage >= pagination.pages || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectTeam;
