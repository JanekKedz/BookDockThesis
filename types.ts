// Navigation types
export type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  Register: undefined;
  Home: { searchQuery?: string }; 
  GuideListings: undefined;
  ProfileView: undefined;
  GuideDetailsScreen: { guideId: number }; // Pass guideId as a parameter
  DockDetails: {dockId: number; fromDate: Date; toDate: Date; price: number }; // Pass docking spot ID as a parameter
  BookingDetails: { dockId: number; fromDate: Date; toDate: Date; price: number }; // Pass docking spot ID and dates
  BookingListings: undefined;
  DockOwnerScreen: undefined;
  AddDockScreen: { portId: number }; // Pass port ID to add a new dock
  PortDetails: { portId: number, fromDate: Date, toDate: Date }; 
  AddPortScreen: undefined;
  Map: { searchQuery?: string };
};

// API / model types
export type DockingSpot = {
  id: number;
  name: string;
  location: string;
  description: string;
  ownerId: number;
  portId: number;
  services: string;
  servicesPricing: number;
  pricePerNight: number;
  pricePerPerson: number;
  availability: number;
};

export type Port = {
  id: number;
  name: string;
  location: string;
  description: string;
  ownerId: number;
  imageIdsStr: string;
  imageIds: string[];
  approved: boolean;
};

export type Guide = {
  id: number;
  title: string;
  content: string;
  authorId: number;
  publicationDate: string;
  images: string[];
  links: string[];
  guideStatus: string;
  guideCategory: string;
};

export type ImageObj = {
  id: number;
  base64Image: string;
}

export type Booking = {
  id: number;
  sailorId: number;
  dockId: number;
  startDate: string;
  endDate: string;
  people: number;
  paymentMethod: string;
  paymentStatus: string;
  totalPrice: number;
};
