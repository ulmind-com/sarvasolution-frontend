import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const UpdateProfile = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dob, setDob] = useState<Date>();
  const [nomineeDob, setNomineeDob] = useState<Date>();

  const handleUpdate = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast({
      title: "Profile Updated Successfully",
      description: "Your profile changes have been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Update Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="personal">Personal Details</TabsTrigger>
              <TabsTrigger value="contact">Contact Details</TabsTrigger>
              <TabsTrigger value="banking">Banking Details</TabsTrigger>
              <TabsTrigger value="nominee">Nominee Details</TabsTrigger>
              <TabsTrigger value="kyc">KYC Details</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <div className="flex items-center gap-6 mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {currentUser?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="photo" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </div>
                  </Label>
                  <input type="file" id="photo" className="hidden" accept="image/*" />
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sponsor ID</Label>
                  <Input 
                    value={currentUser?.sponsorId || 'N/A'} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sponsor Name</Label>
                  <Input 
                    value="Admin Master" 
                    disabled 
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Member ID</Label>
                  <Input 
                    value={currentUser?.id} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue={currentUser?.name} />
                </div>
                <div className="space-y-2">
                  <Label>Joining Date</Label>
                  <Input 
                    value={currentUser?.joinDate ? format(new Date(currentUser.joinDate), 'PPP') : ''} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dob && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dob ? format(dob, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dob}
                        onSelect={setDob}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input type="tel" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" defaultValue={currentUser?.email} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Textarea placeholder="Enter your complete address" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="Enter city" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="karnataka">Karnataka</SelectItem>
                      <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="gujarat">Gujarat</SelectItem>
                      <SelectItem value="rajasthan">Rajasthan</SelectItem>
                      <SelectItem value="west-bengal">West Bengal</SelectItem>
                      <SelectItem value="uttar-pradesh">Uttar Pradesh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pin Code</Label>
                  <Input type="text" placeholder="XXXXXX" maxLength={6} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="banking" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input type="text" placeholder="Enter account number" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Account Number</Label>
                  <Input type="text" placeholder="Re-enter account number" />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code</Label>
                  <Input type="text" placeholder="XXXX0XXXXXX" />
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input type="text" placeholder="Enter bank name" />
                </div>
                <div className="space-y-2">
                  <Label>Branch Name</Label>
                  <Input type="text" placeholder="Enter branch name" />
                </div>
                <div className="space-y-2">
                  <Label>PAN Card Number</Label>
                  <Input type="text" placeholder="XXXXX0000X" maxLength={10} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nominee" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nominee Name</Label>
                  <Input type="text" placeholder="Enter nominee full name" />
                </div>
                <div className="space-y-2">
                  <Label>Relation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="father">Father</SelectItem>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="son">Son</SelectItem>
                      <SelectItem value="daughter">Daughter</SelectItem>
                      <SelectItem value="brother">Brother</SelectItem>
                      <SelectItem value="sister">Sister</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !nomineeDob && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nomineeDob ? format(nomineeDob, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={nomineeDob}
                        onSelect={setNomineeDob}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="kyc" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aadhaar Card (Front)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                    <input type="file" className="hidden" accept="image/*" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Aadhaar Card (Back)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                    <input type="file" className="hidden" accept="image/*" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>PAN Card</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                    <input type="file" className="hidden" accept="image/*" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <div className="mt-8 pt-6 border-t border-border">
              <Button onClick={handleUpdate} disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Changes'
                )}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateProfile;
