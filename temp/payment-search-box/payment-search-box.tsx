'use client';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import { Search, X } from 'lucide-react';
import {useState} from "react";

interface SearchCriteria {
  transactionId: string;
  transactionAmount: string;
  dateStart: string;
  dateEnd: string;
}

function PaymentSearchBox() {
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    transactionId: '',
    transactionAmount: '',
    dateStart: '',
    dateEnd: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleInputChange = (field: keyof SearchCriteria, value: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    // Check if at least one search criteria is provided
    const hasSearchCriteria = Object.values(searchCriteria).some(value => value.trim() !== '');
    
    if (!hasSearchCriteria) {
      return; // Don't search if no criteria provided
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // Simulate search API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically make an API call with the search criteria
      console.log('Searching with criteria:', searchCriteria);
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchCriteria({
      transactionId: '',
      transactionAmount: '',
      dateStart: '',
      dateEnd: ''
    });
    setHasSearched(false);
  };

  const hasSearchCriteria = Object.values(searchCriteria).some(value => value.trim() !== '');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Search for a transaction</CardTitle>
          <CardDescription>You can search for a transaction by ID, Amount, or Date Range.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end max-w-full">
            {/* Form inputs - maintaining original sizing with max-w-sm */}
            <div className="grid items-center gap-1.5 w-56 md:w-64 lg:w-72 shrink-0">
              <Label htmlFor="transaction-id">Transaction ID</Label>
              <Input 
                type="text" 
                id="transaction-id" 
                placeholder="Enter Transaction ID"
                value={searchCriteria.transactionId}
                onChange={(e) => handleInputChange('transactionId', e.target.value)}
                disabled={isSearching}
              />
            </div>
            <div className="grid items-center gap-1.5 w-56 md:w-64 lg:w-72 shrink-0">
              <Label htmlFor="transaction-amount">Transaction Amount</Label>
              <Input 
                type="text" 
                id="transaction-amount" 
                placeholder="Enter Amount"
                value={searchCriteria.transactionAmount}
                onChange={(e) => handleInputChange('transactionAmount', e.target.value)}
                disabled={isSearching}
              />
            </div>
            <div className="grid items-center gap-1.5 w-56 md:w-64 lg:w-72 shrink-0">
              <Label htmlFor="date-start">Date Range (Start)</Label>
              <Input 
                type="date" 
                id="date-start"
                value={searchCriteria.dateStart}
                onChange={(e) => handleInputChange('dateStart', e.target.value)}
                disabled={isSearching}
              />
            </div>
            <div className="grid items-center gap-1.5 w-56 md:w-64 lg:w-72 shrink-0">
              <Label htmlFor="date-end">Date Range (End)</Label>
              <Input 
                type="date" 
                id="date-end"
                value={searchCriteria.dateEnd}
                onChange={(e) => handleInputChange('dateEnd', e.target.value)}
                disabled={isSearching}
              />
            </div>
            
            {/* Buttons positioned directly next to Date Range (End) input in the same row */}
            <div className="flex items-end gap-2 flex-shrink-0">
              <Button 
                onClick={handleSearch}
                disabled={!hasSearchCriteria || isSearching}
                className="flex items-center gap-2"
                size="default"
              >
                <Search className="h-4 w-4" />
                {isSearching ? 'Searching...' : 'Search Transaction'}
              </Button>
              
              <Button 
                onClick={handleClear}
                variant="secondary"
                disabled={isSearching}
                className="flex items-center gap-2 ml-2"
                size="default"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
          
          {/* Search status feedback */}
          {hasSearched && !isSearching && (
            <div className="pt-4">
              <span className="text-sm text-muted-foreground">
                Search completed
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentSearchBox;
