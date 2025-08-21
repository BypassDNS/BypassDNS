// Validation utilities for IP addresses and domains

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Validate IPv4 address
export const validateIPAddress = (ip: string): ValidationResult => {
  if (!ip || ip.trim() === '') {
    return { isValid: false, message: 'IP address is required' };
  }

  const trimmedIp = ip.trim();
  
  // Basic IPv4 regex pattern
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  if (!ipv4Pattern.test(trimmedIp)) {
    return { isValid: false, message: 'Invalid IP address format' };
  }

  // Additional validation for private and reserved ranges
  const parts = trimmedIp.split('.').map(Number);

  // Block broadcast address
  if (parts.every(part => part === 255)) {
    return { isValid: false, message: 'Broadcast address is not allowed' };
  }

  // Block unspecified/zero network
  if (parts[0] === 0) {
    return { isValid: false, message: 'Unspecified (0.0.0.0/8) addresses are not allowed' };
  }

  // Block loopback
  if (parts[0] === 127) {
    return { isValid: false, message: 'Loopback (127.0.0.0/8) addresses are not allowed' };
  }

  // Block link-local
  if (parts[0] === 169 && parts[1] === 254) {
    return { isValid: false, message: 'Link-local (169.254.0.0/16) addresses are not allowed' };
  }

  // Block carrier-grade NAT
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) {
    return { isValid: false, message: 'CGNAT (100.64.0.0/10) addresses are not allowed' };
  }

  // Block private ranges (RFC1918)
  if (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  ) {
    return { isValid: false, message: 'Private IP ranges (RFC1918) are not allowed' };
  }

  // Block multicast and reserved high ranges
  if (parts[0] >= 224) {
    return { isValid: false, message: 'Multicast/Reserved ranges (224.0.0.0/4) are not allowed' };
  }

  return { isValid: true };
};

// Validate domain name
export const validateDomain = (domain: string): ValidationResult => {
  if (!domain || domain.trim() === '') {
    return { isValid: false, message: 'Domain name is required' };
  }

  const trimmedDomain = domain.trim().toLowerCase();
  
  // Domain must contain at least one dot (require TLD)
  if (!trimmedDomain.includes('.')) {
    return { isValid: false, message: 'Domain must include a valid TLD (e.g., .com, .org)' };
  }
  
  // Basic domain validation pattern - requires at least one dot
  const domainPattern = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;
  
  if (!domainPattern.test(trimmedDomain)) {
    return { isValid: false, message: 'Invalid domain name format' };
  }

  // Check length constraints
  if (trimmedDomain.length > 253) {
    return { isValid: false, message: 'Domain name is too long' };
  }

  // Check for consecutive dots
  if (trimmedDomain.includes('..')) {
    return { isValid: false, message: 'Domain cannot contain consecutive dots' };
  }

  // Check if it starts or ends with dot/hyphen
  if (trimmedDomain.startsWith('.') || trimmedDomain.endsWith('.') || 
      trimmedDomain.startsWith('-') || trimmedDomain.endsWith('-')) {
    return { isValid: false, message: 'Domain cannot start or end with dot or hyphen' };
  }

  // Validate TLD (last part after final dot)
  const parts = trimmedDomain.split('.');
  const tld = parts[parts.length - 1];
  if (tld.length < 2) {
    return { isValid: false, message: 'Invalid TLD - must be at least 2 characters' };
  }

  return { isValid: true };
};

// Validate domain:ip pair for batch processing
export const validateDomainIPPair = (entry: string): ValidationResult & { domain?: string; ip?: string } => {
  if (!entry || entry.trim() === '') {
    return { isValid: false, message: 'Entry cannot be empty' };
  }

  const trimmedEntry = entry.trim();
  const parts = trimmedEntry.split(':').map(part => part.trim());
  
  if (parts.length !== 2) {
    return { isValid: false, message: 'Entry must be in format domain:ip' };
  }

  const [domain, ip] = parts;

  if (!domain || !ip) {
    return { isValid: false, message: 'Both domain and IP must be provided' };
  }

  const domainValidation = validateDomain(domain);
  if (!domainValidation.isValid) {
    return { isValid: false, message: `Invalid domain: ${domainValidation.message}` };
  }

  const ipValidation = validateIPAddress(ip);
  if (!ipValidation.isValid) {
    return { isValid: false, message: `Invalid IP: ${ipValidation.message}` };
  }

  return { isValid: true, domain, ip };
};