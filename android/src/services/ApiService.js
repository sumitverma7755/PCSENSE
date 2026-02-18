import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastAndroid } from 'react-native';

// For Android Emulator, use 10.0.2.2 to reach host machine's localhost
// For physical device, use your actual IP: 192.168.29.76
const API_BASE_URL = 'http://10.0.2.2:8000';

class ApiService {
  constructor() {
    this.componentsCache = null;
  }

  // Helper function to safely parse numbers from strings like "60Hz", "16GB", "8 hours"
  parseNumber(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    const str = String(value);
    // Try to parse float first, fallback to int
    let num = parseFloat(str.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) num = parseInt(str.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  }

  // Helper to safely parse refresh rate
  parseRefreshRate(value) {
    if (!value) return 60; // Default to 60Hz
    return this.parseNumber(value);
  }

  // Helper to safely parse RAM
  parseRAM(value) {
    if (!value) return 8;
    return this.parseNumber(value);
  }

  // Helper to safely parse battery
  parseBattery(value) {
    if (!value) return 0;
    return this.parseNumber(value);
  }

  async getComponents() {
    if (this.componentsCache) {
      return this.componentsCache;
    }
    // Try cache first for offline support
    const cached = await AsyncStorage.getItem('components');
    if (cached) {
      ToastAndroid.show('Loaded components from offline cache', ToastAndroid.SHORT);
      this.componentsCache = JSON.parse(cached);
      return this.componentsCache;
    }
    // If not cached, fetch from server with retry
    let attempts = 0;
    let lastError = null;
    while (attempts < 3) {
      try {
        console.log('Fetching components from:', `${API_BASE_URL}/data/components.json`);
        const response = await axios.get(`${API_BASE_URL}/data/components.json`, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
          }
        });
        this.componentsCache = response.data;
        await AsyncStorage.setItem('components', JSON.stringify(response.data));
        ToastAndroid.show('Components loaded successfully', ToastAndroid.SHORT);
        console.log('Components loaded successfully');
        return response.data;
      } catch (error) {
        lastError = error;
        attempts++;
        ToastAndroid.show(`Attempt ${attempts} failed: ${error.message}`, ToastAndroid.SHORT);
        console.warn(`Attempt ${attempts} failed: ${error.message}`);
        await new Promise(res => setTimeout(res, 1000 * attempts)); // Exponential backoff
      }
    }
    ToastAndroid.show('Failed to load components after 3 attempts', ToastAndroid.LONG);
    throw new Error(`Failed to load components after 3 attempts. Make sure server is running at ${API_BASE_URL}. Last error: ${lastError?.message}`);
  }

  async getLaptops(filters = {}) {
    const components = await this.getComponents();
    let laptops = components.laptops || [];

    if (filters.budget) {
      laptops = laptops.filter(l => l.price <= filters.budget);
    }
    if (filters.usage) {
      laptops = laptops.filter(l => l.type === filters.usage || l.type === 'all-purpose');
    }
    if (filters.minRam) {
      laptops = laptops.filter(l => this.parseRAM(l.ram) >= filters.minRam);
    }

    return laptops;
  }

  async recommendLaptop(budget, usage, preferences = {}) {
    const laptops = await this.getLaptops({ budget });
    const scored = laptops.map(laptop => {
      let score = 0;
      // Parse values safely
      const ram = this.parseRAM(laptop.ram);
      const refresh = this.parseRefreshRate(laptop.refresh);
      const battery = this.parseBattery(laptop.battery);
      // Usage-based scoring
      if (usage === 'gaming') {
        if (laptop.type === 'gaming') score += 30;
        if (laptop.gpu && laptop.gpu.includes('RTX')) score += 25;
        if (refresh >= 120) score += 15;
      } else if (usage === 'productivity' || usage === 'office') {
        if (laptop.type === 'office' || laptop.type === 'basic') score += 25;
        if (ram >= 16) score += 20;
        if (battery >= 8) score += 20;
      } else if (usage === 'coding') {
        if (ram >= 16) score += 25;
        if (laptop.storage && (laptop.storage.includes('512GB') || laptop.storage.includes('1TB'))) score += 20;
      } else if (usage === 'content-creation' || usage === 'creative') {
        if (laptop.type === 'creative') score += 30;
        if (laptop.screen && laptop.screen.includes('OLED')) score += 20;
        if (laptop.gpu) score += 15;
      }
      // Budget efficiency bonus
      const budgetUtilization = laptop.price / budget;
      if (budgetUtilization >= 0.85 && budgetUtilization <= 1.0) score += 25;
      else if (budgetUtilization >= 0.70 && budgetUtilization < 0.85) score += 15;
      // Multi-factor: add weight efficiency (lighter laptops +10)
      if (laptop.weight && this.parseNumber(laptop.weight) < 1.5) score += 10;
      // Multi-factor: add brand preference bonus
      if (preferences.cpu && laptop.cpu && laptop.cpu.toLowerCase().includes(preferences.cpu)) score += 5;
      if (preferences.gpu && laptop.gpu && laptop.gpu.toLowerCase().includes(preferences.gpu)) score += 5;
      return { ...laptop, aiScore: score };
    });
    // Sort by score, then price descending
    return scored.sort((a, b) => b.aiScore - a.aiScore || b.price - a.price).slice(0, 3);
  }

  async getLaptopRecommendations(budget, usage, preferences = {}) {
    return this.recommendLaptop(budget, usage, preferences);
  }

  formatINR(value) {
    const amount = Number(value) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  async getDesktopBuild(budget, usage, preferences = {}) {
    const components = await this.getComponents();
    
    if (budget <= 20000) {
      return this.buildAPUPC(components, budget);
    } else if (budget <= 45000) {
      return this.buildBudgetPC(components, budget, usage, preferences);
    } else {
      return this.buildStandardPC(components, budget, usage, preferences);
    }
  }

  buildAPUPC(components, budget) {
    const apuCPUs = components.cpus.filter(c => 
      c.name.includes('Athlon') || (c.name.includes('Ryzen') && c.name.includes('G'))
    );
    
    const cpu = this.selectComponent(apuCPUs, budget * 0.35);
    const mobo = this.selectCompatibleMobo(components.mobos, cpu, budget * 0.20);
    const ram = this.selectComponent(components.ram, budget * 0.20);
    const storage = this.selectComponent(components.storage, budget * 0.15);
    const psu = this.selectComponent(components.psu, budget * 0.06);
    const pcCase = this.selectComponent(components.case, budget * 0.04);

    return {
      cpu,
      gpu: null,
      motherboard: mobo,
      ram,
      storage,
      psu,
      case: pcCase,
      totalPrice: cpu.price + mobo.price + ram.price + storage.price + psu.price + pcCase.price
    };
  }

  buildBudgetPC(components, budget, usage, preferences) {
    const cpuBudget = budget * 0.40;
    const ramBudget = budget * 0.15;
    const storageBudget = budget * 0.15;
    const moboBudget = budget * 0.15;
    const psuBudget = budget * 0.08;
    const caseBudget = budget * 0.07;

    let cpus = components.cpus.filter(c => c.name.includes('Ryzen') && c.name.includes('G'));
    if (preferences.cpu === 'intel') {
      cpus = components.cpus.filter(c => c.name.includes('Core') && c.name.includes('Graphics'));
    }

    const cpu = this.selectComponent(cpus, cpuBudget);
    const mobo = this.selectCompatibleMobo(components.mobos, cpu, moboBudget);
    const ram = this.selectComponent(components.ram, ramBudget);
    const storage = this.selectComponent(components.storage, storageBudget);
    const psu = this.selectComponent(components.psu, psuBudget);
    const pcCase = this.selectComponent(components.case, caseBudget);

    return {
      cpu,
      gpu: null,
      motherboard: mobo,
      ram,
      storage,
      psu,
      case: pcCase,
      totalPrice: cpu.price + mobo.price + ram.price + storage.price + psu.price + pcCase.price
    };
  }

  buildStandardPC(components, budget, usage, preferences) {
    let cpuBudget, gpuBudget;
    
    if (usage === 'gaming') {
      gpuBudget = budget * 0.45;
      cpuBudget = budget * 0.20;
    } else {
      gpuBudget = budget * 0.25;
      cpuBudget = budget * 0.30;
    }

    const ramBudget = budget * 0.12;
    const storageBudget = budget * 0.10;
    const moboBudget = budget * 0.08;
    const psuBudget = budget * 0.08;
    const caseBudget = budget * 0.07;

    // Filter by preferences
    let cpus = components.cpus;
    if (preferences.cpu === 'amd') {
      cpus = cpus.filter(c => c.name.includes('Ryzen') || c.name.includes('Athlon'));
    } else if (preferences.cpu === 'intel') {
      cpus = cpus.filter(c => c.name.includes('Core') || c.name.includes('Pentium'));
    }

    let gpus = components.gpus;
    if (preferences.gpu === 'nvidia') {
      gpus = gpus.filter(g => g.name.includes('RTX') || g.name.includes('GTX'));
    } else if (preferences.gpu === 'amd') {
      gpus = gpus.filter(g => g.name.includes('RX') || g.name.includes('Radeon'));
    }

    const cpu = this.selectComponent(cpus, cpuBudget);
    const gpu = this.selectComponent(gpus, gpuBudget);
    const mobo = this.selectCompatibleMobo(components.mobos, cpu, moboBudget);
    const ram = this.selectComponent(components.ram, ramBudget);
    const storage = this.selectComponent(components.storage, storageBudget);
    const psu = this.selectPSU(components.psu, cpu, gpu, psuBudget);
    const pcCase = this.selectComponent(components.case, caseBudget);

    const totalPrice = cpu.price + gpu.price + mobo.price + ram.price + storage.price + psu.price + pcCase.price;

    return {
      cpu,
      gpu,
      motherboard: mobo,
      ram,
      storage,
      psu,
      case: pcCase,
      totalPrice
    };
  }

  selectComponent(components, budget) {
    if (!components || components.length === 0) return null;
    
    const affordable = components.filter(c => c.price <= budget * 1.1);
    if (affordable.length === 0) return components[0];
    
    affordable.sort((a, b) => b.price - a.price);
    return affordable[0];
  }

  selectCompatibleMobo(mobos, cpu, budget) {
    if (!cpu || !mobos) return mobos[0];
    
    const socket = cpu.socket || cpu.spec?.match(/Socket: ([\w-]+)/)?.[1] || 'AM4';
    const compatible = mobos.filter(m => m.socket === socket && m.price <= budget * 1.1);
    
    if (compatible.length === 0) {
      const anySocket = mobos.filter(m => m.socket === socket);
      return anySocket[0] || mobos[0];
    }
    
    compatible.sort((a, b) => b.price - a.price);
    return compatible[0];
  }

  selectPSU(psus, cpu, gpu, budget) {
    if (!psus) return null;
    
    const cpuTDP = this.parseNumber(cpu?.spec?.match(/TDP: (\d+)W/)?.[1] || '65');
    const gpuTDP = gpu ? this.parseNumber(gpu.spec?.match(/TDP: (\d+)W/)?.[1] || '150') : 0;
    const requiredWattage = (cpuTDP + gpuTDP + 100) * 1.2;

    const suitable = psus.filter(p => {
      const wattage = this.parseNumber(p.name.match(/(\d+)W/)?.[1] || '450');
      return wattage >= requiredWattage && p.price <= budget * 1.2;
    });

    return suitable[0] || psus[0];
  }

  async getPriceHistory(itemId) {
    try {
      const history = await AsyncStorage.getItem(`price_history_${itemId}`);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading price history:', error);
      return [];
    }
  }

  async login(username, password) {
    const users = await AsyncStorage.getItem('users');
    const userList = users ? JSON.parse(users) : [];
    
    const user = userList.find(u => u.username === username && u.password === password);
    if (user) {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, user };
    }
    
    return { success: false, error: 'Invalid credentials' };
  }

  async register(username, password, email) {
    const users = await AsyncStorage.getItem('users');
    const userList = users ? JSON.parse(users) : [];
    
    if (userList.find(u => u.username === username)) {
      return { success: false, error: 'Username already exists' };
    }

    const newUser = { username, password, email, createdAt: Date.now() };
    userList.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(userList));
    await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return { success: true, user: newUser };
  }

  async logout() {
    await AsyncStorage.removeItem('currentUser');
  }

  async getCurrentUser() {
    const user = await AsyncStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
}

export default new ApiService();
