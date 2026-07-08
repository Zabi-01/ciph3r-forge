import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Trash2, Activity, Clock, Shield, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  // Check admin access
  const [isAdmin, setIsAdmin] = useState(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        console.log('Current user:', user, 'role:', user?.role);
        setIsAdmin(user?.role === 'admin');
      } catch (error) {
        console.error('Error checking admin:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  // Fetch activity logs - only for admins
  const { data: activityLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: () => base44.entities.UserActivityLog.list('-timestamp', 100),
    enabled: isAdmin === true,
  });

  // Fetch chat limits - only for admins
  const { data: chatLimits = [] } = useQuery({
    queryKey: ['chatLimits'],
    queryFn: () => base44.entities.UserChatLimit.list(),
    enabled: isAdmin === true,
  });

  // Fetch users - only after admin check passes
  const { data: users = [], isLoading: usersLoading, refetch, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getAllUsers', {});
      const usersList = response.data.users || [];
      console.log('Users fetched:', usersList);
      return usersList;
    },
    enabled: isAdmin === true,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    retry: false,
  });

  // Debug: log when users change
  useEffect(() => {
    console.log('Users state updated:', users, 'count:', users.length);
  }, [users]);

  // Refetch users when admin status changes
  useEffect(() => {
    if (isAdmin === true) {
      refetch();
    }
  }, [isAdmin, refetch]);

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (email) => {
      const usersToDelete = await base44.entities.User.filter({ email });
      if (usersToDelete.length > 0) {
        await base44.entities.User.delete(usersToDelete[0].id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  if (checkingAdmin || isAdmin === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold font-mono mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">Admin privileges required</p>
        <Button
          variant="outline"
          onClick={async () => {
            const user = await base44.auth.me();
            alert(`Current User:\nEmail: ${user?.email}\nRole: ${user?.role}\n\nTo access admin panel, login with:\n- suporteagrocacau@gmail.com\n- zzaa57629@gmail.com`);
          }}
        >
          Check My Account
        </Button>
      </div>
    );
  }

  // Filter users by search
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get user's chat usage today
  const getChatUsage = (email) => {
    const today = new Date().toISOString().split('T')[0];
    const limit = chatLimits.find(l => l.user_email === email && l.date === today);
    return limit ? limit.chat_duration_seconds : 0;
  };

  // Format seconds to minutes
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Get user's activity logs
  const getUserLogs = (email) => {
    return activityLogs.filter(log => log.user_email === email);
  };

  const handleDeleteUser = async (email) => {
    if (confirm(`Are you sure you want to delete user ${email}?`)) {
      deleteUserMutation.mutate(email);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono tracking-tight">
          <Shield className="w-6 h-6 inline mr-2 text-chart-2" />
          Admin Panel
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">User management and activity monitoring</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono text-muted-foreground">Activity Logs</CardTitle>
            <Activity className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{activityLogs.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono text-muted-foreground">Active Today</CardTitle>
            <Clock className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {chatLimits.filter(l => l.date === new Date().toISOString().split('T')[0]).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-mono text-muted-foreground">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-background/50 border border-border/50">
          <TabsTrigger value="users" className="font-mono text-xs">Users</TabsTrigger>
          <TabsTrigger value="activity" className="font-mono text-xs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="font-mono text-sm">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="font-mono text-xs bg-background/50 border-border/50"
                />
              </div>
              <div className="rounded-md border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="font-mono text-xs">Email</TableHead>
                      <TableHead className="font-mono text-xs">Role</TableHead>
                      <TableHead className="font-mono text-xs">Chat Usage Today</TableHead>
                      <TableHead className="font-mono text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 font-mono text-xs text-muted-foreground">
                          Loading users...
                        </TableCell>
                      </TableRow>
                    ) : usersError && isAdmin === true ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 font-mono text-xs text-destructive">
                          Error loading users: {usersError.message}
                        </TableCell>
                      </TableRow>
                    ) : !users || users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 font-mono text-xs text-muted-foreground">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 font-mono text-xs text-muted-foreground">
                          {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="border-border/50">
                          <TableCell className="font-mono text-xs">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {formatDuration(getChatUsage(user.email))} / 10m
                          </TableCell>
                          <TableCell className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-card border-border/50 max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="font-mono">User Activity: {user.email}</DialogTitle>
                                </DialogHeader>
                                <div className="max-h-[400px] overflow-y-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="font-mono text-xs">Module</TableHead>
                                        <TableHead className="font-mono text-xs">Operation</TableHead>
                                        <TableHead className="font-mono text-xs">Time</TableHead>
                                        <TableHead className="font-mono text-xs">Details</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {getUserLogs(user.email).map((log, i) => (
                                        <TableRow key={i}>
                                          <TableCell className="font-mono text-xs">{log.module}</TableCell>
                                          <TableCell className="font-mono text-xs">{log.operation}</TableCell>
                                          <TableCell className="font-mono text-xs">
                                            {new Date(log.timestamp).toLocaleString()}
                                          </TableCell>
                                          <TableCell className="font-mono text-xs max-w-[200px] truncate">
                                            {log.details}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </DialogContent>
                            </Dialog>
                            {user.role !== 'admin' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleDeleteUser(user.email)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="font-mono text-sm">Recent Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="font-mono text-xs">User</TableHead>
                      <TableHead className="font-mono text-xs">Module</TableHead>
                      <TableHead className="font-mono text-xs">Operation</TableHead>
                      <TableHead className="font-mono text-xs">Page Path</TableHead>
                      <TableHead className="font-mono text-xs">Recipe</TableHead>
                      <TableHead className="font-mono text-xs">Timestamp</TableHead>
                      <TableHead className="font-mono text-xs">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.slice(0, 50).map((log, i) => (
                      <TableRow key={i} className="border-border/50">
                        <TableCell className="font-mono text-xs">{log.user_email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{log.module}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{log.operation}</TableCell>
                        <TableCell className="font-mono text-xs">
                          <Badge variant="secondary" className="text-xs">{log.page_path || '-'}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          <Badge variant="secondary" className="text-xs">{log.recipe_name || '-'}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-[300px] truncate">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}