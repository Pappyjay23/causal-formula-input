import axios from 'axios';

export interface AutocompleteItem {
    name: string;
    category: string;
    value: number | string;
    id: string;
    description?: string;
    inputs?: string;
}

export const fetchAutocompleteSuggestions = async (query: string): Promise<AutocompleteItem[]> => {
  const response = await axios.get('https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete');
  const data: AutocompleteItem[] = response.data;
  
  // Filter the results based on the query
  return data.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );
};