export interface RootObject {
    page: string;
    pageSize: string;
    total: number;
    rows: Row[];
  }
  
export interface Row {
    eventId: number;
    hostUserId?: any;
    hostOrganizationId: number;
    name: string;
    eventSignature: string;
    startDate: string;
    endDate: string;
    refundDueDate: string;
    tag: string;
    description: string;
    charge: boolean;
    published: boolean;
    limitWaiters: number;
    surveyRequired: boolean;
    surveyBeforePayment: boolean;
    external: boolean;
    externalLink: string;
    createdAt: string;
    isHostPicked: boolean;
    tickets: Ticket[];
    location: Location;
    metadata: Metadata;
    hostOrganization: HostOrganization;
    hostUser?: any;
  }
  
  interface HostOrganization {
    organizationId: number;
    name: string;
    description: string;
    profileImage: string;
    bannerImage: string;
    headerImage: string;
    useHeaderImage: boolean;
    detailedDescription: string;
    mainColor: string;
    since: string;
    createdAt: string;
  }
  
export interface Metadata {
    contents: string;
    coverImage: string;
    bannerImage: string;
  }
  
  export interface Location {
    locationId: number;
    eventId: number;
    name: string;
    description: string;
    countryCode: string;
    state: string;
    city: string;
    postalCode: string;
    address: string;
    latitude: number;
    longitude: number;
  }
  
  export interface Ticket {
    registable: boolean;
    ticketId: number;
    eventId: number;
    name: string;
    description: string;
    type: string;
    price: number;
    currency: string;
    count: number;
    quantity: number;
    limitPerUser: number;
    saleStartDate: string;
    saleEndDate: string;
    refundDueDate: string;
    hideRemains: boolean;
    useSurvey: boolean;
    surveyNotice: string;
  }