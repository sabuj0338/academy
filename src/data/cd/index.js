import a from './a.js';
import b from './b.js';
import c from './c.js';

// Cloud ও DevOps কোর্স — ১২টি phase, প্রতিটিতে একটি lesson
export const cdPhases = [
  { id: 1, title: 'Cloud Fundamentals', bn: 'Cloud-এর ভিত্তি', color: '#10b981', desc: 'Cloud, IaaS/PaaS/SaaS, region, AZ, খরচ' },
  { id: 2, title: 'Linux', bn: 'Linux', color: '#14b8a6', desc: 'Command line, file, permission, process' },
  { id: 3, title: 'Git', bn: 'Git ও GitHub', color: '#06b6d4', desc: 'Commit, branch, merge, pull request' },
  { id: 4, title: 'Docker', bn: 'Docker', color: '#0ea5e9', desc: 'Container, image, Dockerfile, volume' },
  { id: 5, title: 'Docker Compose', bn: 'Compose', color: '#3b82f6', desc: 'Multi-container app, network, healthcheck' },
  { id: 6, title: 'CI/CD', bn: 'CI/CD', color: '#6366f1', desc: 'GitHub Actions, secret, নিরাপদ deploy' },
  { id: 7, title: 'Infrastructure as Code', bn: 'Terraform', color: '#8b5cf6', desc: 'Plan, apply, state, module' },
  { id: 8, title: 'Cloud Networking', bn: 'Cloud network', color: '#a855f7', desc: 'VPC, subnet, security group, load balancer' },
  { id: 9, title: 'Kubernetes', bn: 'Kubernetes', color: '#d946ef', desc: 'Pod, deployment, service, rollout' },
  { id: 10, title: 'Monitoring', bn: 'Monitoring', color: '#ec4899', desc: 'Log, metric, alert, SLO' },
  { id: 11, title: 'Security & Cost', bn: 'Security ও খরচ', color: '#f43f5e', desc: 'IAM, least privilege, budget' },
  { id: 12, title: 'Capstone', bn: 'Capstone', color: '#f59e0b', desc: 'Idea থেকে production' },
];

export const cdLessons = [...a, ...b, ...c];
