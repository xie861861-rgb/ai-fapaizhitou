export interface Property {
  id: string;
  title: string;
  location: string;
  startingPrice: number;
  evaluationPrice: number;
  aiPredictedPrice: number;
  area: number;
  floor: string;
  builtDate: string;
  usage: string;
  status: string;
  timeLeft: string;
  riskLevel: 'low' | 'medium' | 'high';
  difficultyRating: number; // 1-5 stars
  loanEstimate: {
    maxLoan: number;
    downPayment: number;
    monthlyPayment: number;
  };
  tags: string[];
  images: string[];
  type: 'commercial' | 'residential';
  profitPotential: number;
}

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: '汤臣一品 顶层复式豪华住宅',
    location: '上海市浦东新区花园石桥路28弄',
    startingPrice: 82450000,
    evaluationPrice: 110200000,
    aiPredictedPrice: 108500000,
    area: 434.5,
    floor: '42 / 55 层',
    builtDate: '2019.05.12',
    usage: '成套住宅',
    status: '拍卖中',
    timeLeft: '4天 12小时',
    riskLevel: 'low',
    difficultyRating: 2,
    loanEstimate: {
      maxLoan: 55000000,
      downPayment: 27450000,
      monthlyPayment: 285000,
    },
    tags: ['产证清晰', '无租赁', '二拍房源'],
    images: [
      'https://picsum.photos/seed/tcyp1/1200/800',
      'https://picsum.photos/seed/tcyp2/800/600',
      'https://picsum.photos/seed/tcyp3/800/600',
    ],
    type: 'residential',
    profitPotential: 31.6,
  },
  {
    id: '2',
    title: '静安国际金融中心 2201室',
    location: '上海市 静安区',
    startingPrice: 12400000,
    evaluationPrice: 18000000,
    aiPredictedPrice: 16500000,
    area: 180.5,
    floor: '22 / 45 层',
    builtDate: '2015.08.20',
    usage: '办公',
    status: '拍卖中',
    timeLeft: '2天 08小时',
    riskLevel: 'low',
    difficultyRating: 1,
    loanEstimate: {
      maxLoan: 8000000,
      downPayment: 4400000,
      monthlyPayment: 42000,
    },
    tags: ['产证清晰', '无租赁', '二拍房源'],
    images: [
      'https://picsum.photos/seed/jafc1/1200/800',
      'https://picsum.photos/seed/jafc2/800/600',
    ],
    type: 'commercial',
    profitPotential: 32.4,
  },
  {
    id: '3',
    title: '滨江花园别墅 12号楼',
    location: '上海市 浦东新区',
    startingPrice: 8100000,
    evaluationPrice: 10000000,
    aiPredictedPrice: 9500000,
    area: 260.0,
    floor: '1-3 层',
    builtDate: '2010.03.15',
    usage: '住宅',
    status: '拍卖中',
    timeLeft: '5天 04小时',
    riskLevel: 'medium',
    difficultyRating: 4,
    loanEstimate: {
      maxLoan: 5000000,
      downPayment: 3100000,
      monthlyPayment: 26000,
    },
    tags: ['学区优质', '高溢价区域'],
    images: [
      'https://picsum.photos/seed/bjhy1/1200/800',
    ],
    type: 'residential',
    profitPotential: 18.2,
  },
  {
    id: '4',
    title: '中心公园景观公寓 14C',
    location: '上海市 黄浦区',
    startingPrice: 5200000,
    evaluationPrice: 7000000,
    aiPredictedPrice: 6500000,
    area: 95.0,
    floor: '14 / 32 层',
    builtDate: '2018.11.10',
    usage: '住宅',
    status: '拍卖中',
    timeLeft: '1天 15小时',
    riskLevel: 'low',
    difficultyRating: 2,
    loanEstimate: {
      maxLoan: 3500000,
      downPayment: 1700000,
      monthlyPayment: 18000,
    },
    tags: ['快速变现', '地铁沿线'],
    images: [
      'https://picsum.photos/seed/zxgy1/1200/800',
    ],
    type: 'residential',
    profitPotential: 24.5,
  }
];
