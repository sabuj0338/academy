import a from './a.js';
import b from './b.js';
import c from './c.js';

export const netPhases = [
  { id: 1, title: 'Networking Fundamentals', bn: 'নেটওয়ার্কের ভিত্তি', color: '#22d3ee', desc: 'Network, LAN/WAN, Internet, client-server, topology' },
  { id: 2, title: 'Network Models', bn: 'OSI ও TCP/IP', color: '#38bdf8', desc: 'OSI ৭ layer, TCP/IP ৪ layer, encapsulation' },
  { id: 3, title: 'IP Addressing', bn: 'IP ঠিকানা', color: '#60a5fa', desc: 'IPv4, IPv6, public/private, subnet, CIDR' },
  { id: 4, title: 'Network Devices', bn: 'নেটওয়ার্ক যন্ত্র', color: '#818cf8', desc: 'Router, switch, hub, gateway, modem, AP' },
  { id: 5, title: 'Core Protocols', bn: 'মূল Protocol', color: '#a78bfa', desc: 'TCP, UDP, ICMP, ARP, DHCP' },
  { id: 6, title: 'DNS', bn: 'DNS', color: '#c084fc', desc: 'Hierarchy, record types, resolution, TTL' },
  { id: 7, title: 'Ports & Sockets', bn: 'Port ও Socket', color: '#e879f9', desc: 'Port number, socket, listening, states' },
  { id: 8, title: 'Routing', bn: 'Routing', color: '#f472b6', desc: 'Routing table, gateway, NAT, static/dynamic' },
  { id: 9, title: 'HTTP Networking', bn: 'HTTP Networking', color: '#fb7185', desc: 'HTTP/1.1, HTTP/2, HTTP/3, WebSocket' },
  { id: 10, title: 'TLS & Encryption', bn: 'TLS ও Encryption', color: '#fb923c', desc: 'Handshake, certificate, keys, CA' },
  { id: 11, title: 'Network Troubleshooting', bn: 'সমস্যা সমাধান', color: '#fbbf24', desc: 'ping, traceroute, dig, curl, tcpdump, Wireshark' },
  { id: 12, title: 'Advanced Networking', bn: 'Advanced', color: '#4ade80', desc: 'VPN, proxy, load balancing, CDN, anycast' },
];

export const netLessons = [...a, ...b, ...c];
