
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Download, Eye, Shield, AlertTriangle } from 'lucide-react';
import { useAssessment } from '../contexts/AssessmentContext';

const DataManagement = () => {
  const { responses, resetAssessment } = useAssessment();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      // Clear assessment data
      resetAssessment();
      
      // Clear any stored consent data
      localStorage.removeItem('privacy_consent');
      localStorage.removeItem('consent_timestamp');
      
      // Clear any other app data
      localStorage.removeItem('user_preferences');
      
      console.log('All user data deleted successfully');
      alert('All your data has been permanently deleted.');
      
    } catch (error) {
      console.error('Error deleting user data:', error);
      alert('There was an error deleting your data. Please contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadData = () => {
    const userData = {
      assessmentResponses: responses,
      consentData: {
        granted: localStorage.getItem('privacy_consent'),
        timestamp: localStorage.getItem('consent_timestamp')
      },
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mynd-ease-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasData = Object.keys(responses).length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Your Data & Privacy
          </CardTitle>
          <p className="text-gray-600">
            Manage your personal data and privacy settings. You have full control over your information.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Data Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Assessment Responses</span>
                <Badge variant={hasData ? "default" : "secondary"}>
                  {hasData ? `${Object.keys(responses).length} responses` : 'No data'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Voice Conversations</span>
                <Badge variant="secondary">Session-only (not stored)</Badge>
              </div>
            </div>
          </div>

          {/* Data Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <Eye className="h-8 w-8 text-blue-600 mx-auto" />
                  <h4 className="font-semibold">View Data</h4>
                  <p className="text-sm text-gray-600">
                    See what data we have about you
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => console.log('Current data:', responses)}
                  >
                    View in Console
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <Download className="h-8 w-8 text-green-600 mx-auto" />
                  <h4 className="font-semibold">Download Data</h4>
                  <p className="text-sm text-gray-600">
                    Export your data in JSON format
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleDownloadData}
                    disabled={!hasData}
                  >
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <Trash2 className="h-8 w-8 text-red-600 mx-auto" />
                  <h4 className="font-semibold">Delete Data</h4>
                  <p className="text-sm text-gray-600">
                    Permanently remove all your data
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-red-600 border-red-300 hover:bg-red-50"
                        disabled={!hasData}
                      >
                        Delete All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          Delete All Personal Data
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete:
                          <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li>All assessment responses</li>
                            <li>Privacy consent records</li>
                            <li>Any stored preferences</li>
                          </ul>
                          <p className="mt-3 font-medium">
                            Are you sure you want to permanently delete all your data?
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAllData}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Privacy Rights */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Your Privacy Rights</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Right to access your personal data</p>
              <p>• Right to rectification of inaccurate data</p>
              <p>• Right to erasure ("right to be forgotten")</p>
              <p>• Right to restrict processing</p>
              <p>• Right to data portability</p>
              <p>• Right to withdraw consent</p>
            </div>
            <p className="text-sm text-blue-600 mt-3">
              For any privacy requests, contact: <strong>privacy@mynde.ase</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagement;
