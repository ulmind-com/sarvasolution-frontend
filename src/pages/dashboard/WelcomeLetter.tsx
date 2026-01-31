import { useRef, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

const WelcomeLetter = () => {
  const { user } = useAuthStore();
  const letterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return 'N/A';
    }
  };

  const downloadPDF = async () => {
    if (!letterRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(letterRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Welcome_Letter_${user?.memberId || 'User'}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-[800px] w-full" />
      </div>
    );
  }

  const salutation = user.fullName?.startsWith('Mrs') || user.fullName?.startsWith('Ms') ? 'Ms.' : 'Mr.';

  return (
    <div className="space-y-6">
      {/* Header with Download Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome Letter</h1>
          <p className="text-muted-foreground text-sm">Your official joining confirmation document</p>
        </div>
        <Button onClick={downloadPDF} disabled={isGenerating} className="gap-2">
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {/* A4 Letter Container */}
      <Card className="overflow-hidden shadow-2xl">
        <div 
          ref={letterRef}
          id="welcome-letter-content"
          className="bg-white text-gray-900 relative"
          style={{ 
            width: '210mm', 
            minHeight: '297mm',
            maxWidth: '100%',
            margin: '0 auto',
            padding: '0',
            fontFamily: 'Georgia, serif'
          }}
        >
          {/* Header Geometric Shapes */}
          <div className="relative h-32 overflow-hidden">
            {/* Red Shape - Left */}
            <div 
              className="absolute top-0 left-0 w-48 h-32 bg-red-600"
              style={{ 
                clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0 100%)',
              }}
            />
            {/* Green Shape - Right of Red */}
            <div 
              className="absolute top-0 left-24 w-40 h-32 bg-green-600"
              style={{ 
                clipPath: 'polygon(30% 0, 100% 0, 70% 100%, 0 100%)',
              }}
            />
            {/* Additional accent */}
            <div 
              className="absolute top-0 right-0 w-32 h-20 bg-green-600"
              style={{ 
                clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)',
              }}
            />
          </div>

          {/* Logo */}
          <div className="flex justify-center -mt-16 relative z-10">
            <img 
              src="https://res.cloudinary.com/dkgwi1xvx/image/upload/v1769630007/sdfsdf_q4ziyu.png" 
              alt="Sarva Solution Vision" 
              className="h-20 w-auto bg-white p-2 rounded-lg shadow-md"
            />
          </div>

          {/* Company Header */}
          <div className="text-center px-8 mt-4 space-y-1">
            <h2 className="text-xl font-bold text-gray-900 tracking-wide">
              SARVA SOLUTION VISION PVT LTD
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Head Office - Tarafdar Bhavan - 1st Floor, Atghora, Phool Tala, (Near - Chinar Park) Rajarhat Road, Kolkata - 700136
            </p>
            <p className="text-xs text-gray-600">
              Corporate Office - P.C. Mitra Lane, Parapukur (Near - Tinkonia Bus Stand), Purba Bardhaman, Pin - 713101
            </p>
            <p className="text-xs text-gray-600">
              Phone: +91 98322 57991 | Web: www.sarvasolution.com | E-mail: sarvasolution25@gmail.com
            </p>
          </div>

          {/* Divider */}
          <div className="mx-8 my-6 border-t-2 border-gray-300" />

          {/* Main Content */}
          <div className="px-10 pb-8">
            {/* Title */}
            <h1 className="text-3xl font-bold text-center text-green-700 mb-6 tracking-wide">
              CONGRATULATIONS!
            </h1>

            {/* Salutation */}
            <div className="mb-6">
              <p className="text-lg">
                {salutation} <span className="font-bold text-gray-900">{user.fullName}</span>
              </p>
              <p className="text-base mt-2 text-gray-800">
                WELCOME to the growing family of <span className="font-semibold">SARVA SOLUTION VISION PVT LTD</span>!
              </p>
            </div>

            {/* Body Paragraphs */}
            <div className="space-y-4 text-sm text-gray-700 text-justify leading-relaxed">
              <p>
                We sincerely believe that your decision to join our company as an Individual Distributor will help and support the company in achieving its goals in a short time. You will also discover that being a part of this growing family provides you excellent opportunities to get everything you ever desired.
              </p>
              <p>
                Our primary goal is to provide high-quality health care and other products to our customers at affordable prices through our network of dedicated distributors like you. We are committed to your success and growth within our organization.
              </p>
              <p>
                As you begin this exciting journey with us, remember that success comes to those who work with dedication, integrity, and a spirit of teamwork. Our support system is designed to help you every step of the way—from training sessions to marketing materials, we've got you covered.
              </p>
              <p className="font-medium text-gray-800">
                <em>"If you grow, the company will grow"</em>—this is the motto of our organization. We believe in mutual growth and prosperity for all our members.
              </p>
              <p>
                With best wishes: <span className="font-semibold text-green-700">"Fly high with us as a family member."</span>
              </p>
            </div>

            {/* Dynamic Details Section */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Your Membership Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Member ID:</span>
                  <p className="font-bold text-green-700">{user.memberId || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Sponsor ID:</span>
                  <p className="font-bold text-gray-900">{user.sponsorId || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date of Joining:</span>
                  <p className="font-bold text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Sign-off */}
            <div className="mt-8 text-right text-sm">
              <p className="text-gray-600 mb-2">If you have any questions, please feel free to contact us.</p>
              <p className="text-gray-700">Thanks and Regards,</p>
              <p className="font-bold text-gray-900 mt-1">Customer Service Department</p>
              <p className="text-green-700 font-semibold">SARVA SOLUTION VISION PVT LTD Team</p>
            </div>
          </div>

          {/* Footer Geometric Shapes */}
          <div className="absolute bottom-0 right-0 h-24 w-full overflow-hidden">
            {/* Green Shape - Bottom Right */}
            <div 
              className="absolute bottom-0 right-0 w-48 h-24 bg-green-600"
              style={{ 
                clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)',
              }}
            />
            {/* Red Shape - Left of Green */}
            <div 
              className="absolute bottom-0 right-24 w-40 h-24 bg-red-600"
              style={{ 
                clipPath: 'polygon(30% 0, 100% 0, 70% 100%, 0 100%)',
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeLetter;
