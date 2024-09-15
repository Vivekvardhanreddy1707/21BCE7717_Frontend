import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Input, Button, Flex, Text, HStack, Table, Thead, Tbody, Tr, Th, Td, VStack, Tag, Checkbox,
  Spinner, Img, Radio, RadioGroup, Stack, InputGroup, InputLeftElement, IconButton
} from '@chakra-ui/react';
import { SearchIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import "./App.css";
import logo from "./logo.jpg"; 
import { CiFilter, CiShare2 } from "react-icons/ci";
import { GoDotFill } from "react-icons/go";
import { BsArrowRepeat, BsThreeDots } from "react-icons/bs";
import { SlChemistry } from "react-icons/sl";

interface TrademarkResult {
  mark_name: string;
  owner_name: string;
  serial_number: string;
  filing_date: string;
  status: string;
  registration_date: string;
  renewal_date: string;
  goods_and_services: string;
  classes: number[];
  image_url?: string;
}

interface ApiResponse {
  results: TrademarkResult[];
  total_results: number;
}

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<TrademarkResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [owners, setOwners] = useState<string[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [ownerSearchQuery, setOwnerSearchQuery] = useState<string>('');
  const [displayMode, setDisplayMode] = useState<string>("list");

  useEffect(() => {
    const uniqueOwners = Array.from(new Set(searchResults.map(result => result.owner_name)));
    setOwners(uniqueOwners);
  }, [searchResults]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.post<ApiResponse>('http://localhost:5000/api/v3/us', {
        input_query: searchQuery,
        status: statusFilter,
        owners: selectedOwners,
        page: 1,
        rows: 10
      });
      setSearchResults(response.data.results);
      setTotalResults(response.data.total_results);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleOwnerToggle = (owner: string) => {
    setSelectedOwners(prev =>
      prev.includes(owner)
        ? prev.filter(o => o !== owner)
        : [...prev, owner]
    );
  };

  const filteredOwners = owners.filter(owner =>
    owner.toLowerCase().includes(ownerSearchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Flex align="center" justify="space-between" ml={5} p={8} borderColor="gray.200">
        <Img src={logo} alt="Trademarkia Logo" maxW="150px" maxH="100px" objectFit="contain" />
        <Flex ml={5} flex={1} mr={900}>
          <InputGroup>
            <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray" />} />
            <Input
              placeholder="Search Trademark Here eg. Mickey Mouse"
              size="md"
              borderRadius="xl"
              mr={2}
              flex={1}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          <Button borderRadius="xl" colorScheme="blue" fontSize="sm" onClick={handleSearch}>Search</Button>
        </Flex>
      </Flex>

      {/* Subheader */}
      <Box p={4} borderBottom="1px" borderColor="gray.200">
        <Text fontWeight="bold" color="gray.500" ml={6} mb={2}>About {totalResults} Trademarks found for "{searchQuery}"</Text>
        <Flex align="center" justify="space-between">
          <HStack>
            <Text ml={6} mr={3} fontWeight="bold" color="gray.500">Owners</Text>
          </HStack>
        </Flex>
      </Box>

      {/* Main content */}
      <Flex>
        <Box flex={3} p={4} bg="white" borderRadius="xl">
          {loading ? (
            <Flex justify="center" align="center" height="400px">
              <Spinner size="xl" />
            </Flex>
          ) : searchResults.length === 0 ? (
            <Flex justify="center" align="center" height="400px">
              <Text fontSize="lg" color="gray.500">No results found for "{searchQuery}"</Text>
            </Flex>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Mark</Th>
                  <Th>Details</Th>
                  <Th>Status</Th>
                  <Th>Class/Description</Th>
                </Tr>
              </Thead>
              <Tbody>
                {searchResults.map((result, index) => (
                  <Tr key={index}>
                    <Td>
                      <Box bg="gray.100" w="150px" h="100px">
                        {result.image_url ? (
                          <Img src={result.image_url} alt={result.mark_name} w="100%" h="100%" objectFit="contain" />
                        ) : (
                          <InfoOutlineIcon w="100%" h="100%" color="gray.400" />
                        )}
                      </Box>
                    </Td>
                    <Td>
                      <VStack align="start">
                        <Text fontWeight="bold">{result.mark_name}</Text>
                        <Text fontSize="sm" color="gray.500">{result.owner_name}</Text>
                        <Text fontSize="sm" fontWeight="bold">{result.serial_number}</Text>
                        <Text fontSize="sm" color="gray.500">{result.filing_date}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start">
                        <HStack spacing={2} align="center">
                          <GoDotFill color={result.status === 'Live/Registered' ? 'green' : 'yellow'} />
                          <Text color={result.status === 'Live/Registered' ? 'green.300' : 'yellow.300'} fontWeight="bold">{result.status}</Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.500">on <span>{result.registration_date}</span></Text>
                        <HStack>
                          <BsArrowRepeat color="red" />
                          <Text fontSize="xs" color="black" fontWeight="bold">{result.renewal_date}</Text>
                        </HStack>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{result.goods_and_services}</Text>
                      <Flex wrap="wrap" gap={1} mt={2}>
                        {result.classes.map((classNum, idx) => (
                          <Tag key={idx} size="md" bg="transparent">
                            <SlChemistry size="25px" />Class {classNum}
                          </Tag>
                        ))}
                        {result.classes.length > 3 && (
                          <Tag borderRadius="100px"><BsThreeDots /></Tag>
                        )}
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>

        {/* Sidebar */}
        <Box flex={1} p={4} borderLeft="1px" borderColor="gray.200">
          <Box p="6" bg="white" borderRadius="md" boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)" mb={6}>
            <Text fontWeight="bold" mb={4}>Filter by Owner</Text>
            <InputGroup mb={4}>
              <InputLeftElement pointerEvents="none"><SearchIcon color="gray.300" /></InputLeftElement>
              <Input
                placeholder="Search Owners"
                value={ownerSearchQuery}
                onChange={(e) => setOwnerSearchQuery(e.target.value)}
              />
            </InputGroup>
            <VStack align="stretch" spacing={2}>
              {filteredOwners.map((owner, index) => (
                <Checkbox
                  key={index}
                  isChecked={selectedOwners.includes(owner)}
                  onChange={() => handleOwnerToggle(owner)}
                >
                  {owner}
                </Checkbox>
              ))}
            </VStack>
          </Box>

          <Box p="6" bg="white" borderRadius="md" boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)">
            <Text fontWeight="bold" mb={4}>Filter by Status</Text>
            <RadioGroup value={statusFilter} onChange={setStatusFilter}>
              <Stack spacing={2}>
                <Radio value="All">All</Radio>
                <Radio value="Live/Registered">Live/Registered</Radio>
                <Radio value="Pending">Pending</Radio>
                <Radio value="Abandoned">Abandoned</Radio>
              </Stack>
            </RadioGroup>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default App;
