import React from 'react';
import { 
  Activity, Bot, Hammer, ShieldAlert, Globe, MessageSquare, 
  Bus, Car, TrainFront, Building, Building2, Trees, Droplets, Zap, School, Hospital, Warehouse, Route, FileText 
} from 'lucide-react';

export const ASSET_TEMPLATES = {
  'overhead-metro': { group: 'Transport', icon: <TrainFront size={16} />, cost: 120, height: 5, radius: 30, color: [59, 130, 246], impacts: { economic: 35, social: 25, environmental: 15 } },
  'bus-terminal': { group: 'Transport', icon: <Bus size={16} />, cost: 15, height: 15, radius: 40, color: [96, 165, 250], impacts: { economic: 10, social: 15, environmental: 5 } },
  'highway-junction': { group: 'Transport', icon: <Route size={16} />, cost: 85, height: 10, radius: 60, color: [30, 64, 175], impacts: { economic: 45, social: -5, environmental: -10 } },
  'flyover-extension': { group: 'Transport', icon: <Activity size={16} />, cost: 40, height: 12, radius: 40, color: [37, 99, 235], impacts: { economic: 20, social: 2, environmental: -5 } },
  'smart-skyscrapper': { group: 'Buildings', icon: <Building2 size={16} />, cost: 200, height: 120, radius: 35, color: [255, 255, 255], impacts: { economic: 80, social: 10, environmental: 5 } },
  'medical-center': { group: 'Buildings', icon: <Hospital size={16} />, cost: 95, height: 40, radius: 45, color: [239, 68, 68], impacts: { economic: 15, social: 45, environmental: 10 } },
  'education-campus': { group: 'Buildings', icon: <School size={16} />, cost: 75, height: 30, radius: 50, color: [16, 185, 129], impacts: { economic: 25, social: 40, environmental: 15 } },
  'logistics-park': { group: 'Buildings', icon: <Warehouse size={16} />, cost: 150, height: 25, radius: 60, color: [245, 158, 11], impacts: { economic: 60, social: 5, environmental: -20 } },
  'apartment-block': { group: 'Buildings', icon: <Building size={16} />, cost: 60, height: 50, radius: 30, color: [209, 213, 219], impacts: { economic: 30, social: 50, environmental: -5 } },
  'industrial-unit': { group: 'Buildings', icon: <Warehouse size={16} />, cost: 110, height: 20, radius: 45, color: [75, 85, 99], impacts: { economic: 50, social: 5, environmental: -30 } },
  'data-center': { group: 'Buildings', icon: <Zap size={16} />, cost: 300, height: 15, radius: 40, color: [79, 70, 229], impacts: { economic: 100, social: 2, environmental: -40 } },
  'solar-grid': { group: 'Energy', icon: <Zap size={16} />, cost: 55, height: 2, radius: 60, color: [251, 191, 36], impacts: { economic: 20, social: 5, environmental: 65 } },
  'filtration-plant': { group: 'Energy', icon: <Droplets size={16} />, cost: 45, height: 18, radius: 40, color: [6, 182, 212], impacts: { economic: 10, social: 25, environmental: 35 } },
  'bio-reserve': { group: 'Energy', icon: <Trees size={16} />, cost: 30, height: 8, radius: 50, color: [34, 197, 94], impacts: { economic: 5, social: 30, environmental: 80 } },
  'power-pylon': { group: 'Energy', icon: <Zap size={16} />, cost: 25, height: 35, radius: 10, color: [100, 116, 139], impacts: { economic: 15, social: 2, environmental: -5 } },
  'street-light': { group: 'Energy', icon: <Zap size={16} />, cost: 5, height: 12, radius: 3, color: [255, 244, 0], impacts: { economic: 2, social: 10, environmental: -1 } }
};

export const CATEGORIES = {
  strategy: { label: 'STRATEGY', icon: Activity },
  directives: { label: 'DIRECTIVES', icon: Bot },
  builder: { label: 'BUILDER', icon: Hammer },
  policy: { label: 'POLICY', icon: FileText },
  social: { label: 'SOCIAL', icon: Globe },
  reports: { label: 'REPORTS', icon: MessageSquare }
};
