        // Global state and question-bank data.
        const settingsKey = 'focusmath-settings-v3';
        let settings = {
            fontChinese: 'source',
            fontLatin: 'inter',
            bgColor: '#FDFBF7',
            darkMode: false,
            stimMode: false,
            fontSize: 16,
            contrast: 100,
            graphNodeOpacity: 86,
            mindmapNodeOpacity: 88,
            graphLinksVisible: true,
            favoritePreviewAnswer: false,
            hideStreaks: false,
            headerLabelsVisible: false,
            hideBackgroundShapes: false,
            bankPageSize: 60,
            statsHistoryLimit: 5,
            statsTrendDays: 14,
            newQuestionRatio: 50,
            calculatorFullExpand: false,
            soundVolume: 50,
            vibrationEnabled: true,
            exportFormat: 'txt',
            graphExportFormat: 'svg',
            aiProvider: 'auto',
            aiBaseUrl: '',
            aiApiKey: '',
            aiModel: '',
            useLocalModel: false,
            localModelType: 'browser',
            browserModel: '',
            ollamaBaseUrl: 'http://localhost:11434',
            ollamaModel: '',
            homeConfirm: true,
            clearConfirm: true,
            sound: {
                enabled: false,
                mode: 'brown', // 'brown' | 'binaural' | 'ambient' | 'lofi'
                volume: 0.12,
                binauralFreq: 40, // 40 | 18 | 12
                binauralBase: 200,
                brownFilter: 400,
                ambientVoices: 4,
                adaptiveVolume: true
            },
            radar: {
                sources: {
                    bilibili: { enabled: true, quality: 0.75 },
                    zhihu:    { enabled: true, quality: 0.65 },
                    mitocw:   { enabled: true, quality: 0.90 },
                    khan:     { enabled: true, quality: 0.85 },
                    blog:     { enabled: true, quality: 0.55 },
                    notes:    { enabled: true, quality: 0.60 }
                },
                customSites: [], // [{ url, name, enabled }]
                workerUrl: '', // Serverless 后端地址（Cloudflare Worker），为空则用 CORS 代理
                filters: {
                    adKeywords: ['课程', '优惠', '报名', '限时', '免费领取'],
                    minQuality: 0.30,
                    difficultyTolerance: 2
                },
                rankWeights: { relevance: 0.35, weaknessMatch: 0.25, quality: 0.20, difficultyFit: 0.10, userFeedback: 0.10 }
            },
            keyboard: {
                enabled: true,
                quizShiftRequired: true,
                cursorStep: 24,
                bindings: {
                    'nav-stats': '1',
                    'nav-bank': '2',
                    'nav-fav': '3',
                    'nav-settings': '4',
                    'nav-focus': '5',
                    'nav-radar': '6',
                    'nav-home': '0',
                    'nav-start-quiz': 's',
                    'quiz-up': 'ArrowUp',
                    'quiz-down': 'ArrowDown',
                    'quiz-left': 'ArrowLeft',
                    'quiz-right': 'ArrowRight',
                    'quiz-confirm': 'Enter',
                    'quiz-cancel': 'Escape',
                    'calc-toggle': 'c',
                    'sound-toggle': 'm',
                    'fav-toggle': 'f',
                    'export-question': 'e',
                    'close-modal': 'Escape',
                    'wb-pen': 'p',
                    'wb-line': 'l',
                    'wb-circle': 'o',
                    'wb-eraser': 'e',
                    'wb-size-down': '[',
                    'wb-size-up': ']',
                    'wb-clear': 'Delete',
                    'calc-evaluate': 'Enter',
                    'calc-backspace': 'Backspace',
                    'calc-clear-close': 'Escape',
                    'calc-angle': 'r',
                    'calc-fill': 'Ctrl+Enter',
                    'bank-search': '/',
                    'bank-prev': '[',
                    'bank-next': ']',
                    'bank-first': 'Home',
                    'bank-last': 'End',
                    'bank-filter': 'f',
                    'bank-enter-preview': 'Enter',
                    'bank-start-preview': 'Ctrl+Enter',
                    'graph-zoom-in': '=',
                    'graph-zoom-out': '-',
                    'graph-node-detail': 'Enter',
                    'graph-cancel': 'Escape'
                },
                disabled: []
            }
        };
        const defaultSettings = JSON.parse(JSON.stringify(settings));
        const state = {
            subject: 'calculus',
            customSubjects: ['calculus'],
            sessionLength: 5,
            adaptiveLength: 5,
            customLength: null,
            questionType: 'all',
            mode: 'adaptive',
            customDifficulty: 5,
            timerMinutes: 0,
            currentQuestionIndex: 0,
            sessionQuestions: [],
            answers: [],
            streak: 0,
            totalAnswered: 0,
            totalCorrect: 0,
            defaultAnswered: 0,
            defaultCorrect: 0,
            allModeStats: { answered: 0, correct: 0, levelSum: 0 },
            perSubject: {
                calculus: { answered: 0, correct: 0, levelSum: 0, bestStreak: 0, currentStreak: 0 },
                linear: { answered: 0, correct: 0, levelSum: 0, bestStreak: 0, currentStreak: 0 },
                probability: { answered: 0, correct: 0, levelSum: 0, bestStreak: 0, currentStreak: 0 }
            },
            allSubjectStats: {
                calculus: { answered: 0, correct: 0, levelSum: 0 },
                linear: { answered: 0, correct: 0, levelSum: 0 },
                probability: { answered: 0, correct: 0, levelSum: 0 }
            },
            topicStats: {},
            answeredQuestionKeys: {},
            correctQuestionKeys: {},
            questionAttemptCounts: {},
            questionLastCorrect: {},
            questionAccuracyScores: {},
            recentPractice: [],
            sessionHistory: [],
            levels: { calculus: 1, linear: 1, probability: 1 },
            favorites: [],
            customQuestions: [],
            achievementFlags: {},
            focusMode: false,
            focusStartTime: 0,
            focusBestSeconds: 0,
            quizStartedAt: 0,
            elapsedSeconds: 0,
            elapsedTimerId: null,
            timerId: null,
            timerRemaining: 0,
            bankSubject: 'calculus',
            bankSearch: '',
            bankPage: 1,
            bankTopicFilters: [],
            quizSource: null,
            bankDeleteMode: false,
            bankDeleteSelected: [],
            audioContext: null,
            masterGain: null,
            activeNodes: [],
            isPlaying: false,
            currentMode: null,
            fadeInterval: null,
            wasPlayingBeforeHidden: false,
            auth: {
                token: null,
                emailHint: null,
                isLoggedIn: false,
                cloudSaves: []
            },
            radar: {
                activeTab: 'search',
                form: { keyword: '', goals: [], platforms: [], types: [], subject: 'all', difficulty: 8, customGoal: '', customPlatform: '' },
                results: [],
                loading: false,
                error: '',
                weakSelection: new Set(),
                noteTargetId: null,
                weakPage: 1,
                resultsPage: 1,
                favoritesPage: 1,
                notesPage: 1,
                weakPageSize: 8,
                resultsPageSize: 8,
                favoritesPageSize: 8,
                notesPageSize: 6
            },
            // Task 5: 动态面包屑栈，按真实访问路径记录
            crumbStack: ['homeScreen']
        };
        // Task 5: 屏幕ID到面包屑标签的映射
        const SCREEN_LABELS = {
            homeScreen: '主页',
            setupScreen: '模式选择',
            quizScreen: '答题中',
            summaryScreen: '结算',
            bankScreen: '题库',
            favoritesScreen: '收藏夹',
            statsScreen: '统计',
            radarScreen: '资源雷达'
        };
        let questionDB = {};
        let subjectNames = {};
        let subjectColors = {};
        let topicRules = {};
        const stopWords = new Set(['的', '是', '在', '和', '或', '有', '为', '与', '及', '等', '一个', '这种', '这些', '那些', '因为', '所以', '如果', '那么', '可以', '需要', '进行', '得到', '求解', '计算', '证明', '下列', '其中', '使得', '满足', '已知', '则', '求', '设', '且', '但', '对于', '关于', '以及', '或者', '还是', '并且']);
        let questionBankSeed = 'local';
        let questionBankRequest = null;
        let questionBankLastBackendRefresh = 0;
        let questionIndexRequest = null;
        let backendQuestionIndex = { revision: '', index: {}, filters: {} };

        // ===== Resource Radar store (memory + localStorage persistence) =====
        const radarStoreKey = 'focusmath-radar-v1';
        let resourceFeedback = { favorited: {}, hidden: {}, useful: {}, useless: {} };
        let resourceNotes = {}; // resourceId -> { text, questionIds: [], topics: [], createdAt }
        // Task 1: 缓存资源完整信息，避免收藏/隐藏后因 state.radar.results 被替换而丢失标题/链接
        let resourceCache = {};
        function loadRadarStore() {
            try {
                const raw = localStorage.getItem(radarStoreKey);
                if (!raw) return;
                const data = JSON.parse(raw);
                if (data.resourceFeedback) resourceFeedback = Object.assign(resourceFeedback, data.resourceFeedback);
                if (data.resourceNotes) resourceNotes = data.resourceNotes;
                if (data.resourceCache) resourceCache = data.resourceCache;
            } catch (e) { console.warn('radar store load failed', e); }
        }
        function saveRadarStore() {
            try {
                localStorage.setItem(radarStoreKey, JSON.stringify({ resourceFeedback, resourceNotes, resourceCache }));
            } catch (e) { console.warn('radar store save failed', e); }
        }
        // Task 1: 把资源完整信息写入缓存
        function cacheResource(r) {
            if (!r || !r.id) return;
            // 仅保留可序列化字段，剔除 _rank
            const { _rank, ...rest } = r;
            resourceCache[r.id] = rest;
        }
        function getCachedResource(id) {
            return resourceCache[id] || null;
        }
        let databaseReady = false;
        let questionBankRevision = 0;
        const questionBankCacheKey = 'focusmath-question-bank-temp-v1';
        const questionBankCacheMs = 5 * 60 * 1000;
        const questionBankBackendRefreshMs = 60 * 1000;
        const fallbackQuestionMeta = {
            version: 'fallback',
            subjects: {
                calculus: { name: '高等数学', color: '#1B6B93' },
                linear: { name: '线性代数', color: '#A18CD1' },
                probability: { name: '概率统计', color: '#4FCCA3' }
            },
            topicRules: {
                calculus: [
                    ['极限', ['lim', '极限', '等价无穷小']],
                    ['导数与微分', ['导数', "f'", 'dy/dx', '切线']],
                    ['积分', ['积分', '\\int', '∫']],
                    ['级数', ['级数', '\\sum', '收敛']],
                    ['多元微积分', ['偏导', '梯度', '二重', '三重']],
                    ['微分方程', ['微分方程', "y'", '通解']]
                ],
                linear: [
                    ['行列式', ['行列式', '|A|', 'det']],
                    ['矩阵运算', ['矩阵', '逆矩阵', '转置']],
                    ['向量组与秩', ['向量', '线性相关', '秩']],
                    ['特征值', ['特征值', '特征向量', '相似']],
                    ['二次型', ['二次型', '正定']],
                    ['线性方程组', ['方程组', 'Ax=0']]
                ],
                probability: [
                    ['古典概率', ['概率', '互斥', '独立']],
                    ['随机变量分布', ['分布', 'B(', 'N(', 'Exp']],
                    ['数字特征', ['期望', '方差', '协方差']],
                    ['大数定律与中心极限定理', ['大数定律', 'CLT']],
                    ['参数估计', ['估计', '矩估计', '似然']],
                    ['假设检验', ['检验', 'p 值', '显著性']]
                ]
            }
        };

        const extendedTopicRules = {
            calculus: [
                ['\u6570\u5217\u6781\u9650', ['\u6570\u5217\u6781\u9650', '\u5355\u8c03\u6709\u754c', '\u5939\u903c\u51c6\u5219', '\u9012\u63a8\u6570\u5217']],
                ['\u51fd\u6570\u6781\u9650', ['lim', '\u51fd\u6570\u6781\u9650', '\u5de6\u6781\u9650', '\u53f3\u6781\u9650', '\u7b49\u4ef7\u65e0\u7a77\u5c0f']],
                ['\u8fde\u7eed\u4e0e\u95f4\u65ad\u70b9', ['\u8fde\u7eed', '\u95f4\u65ad\u70b9', '\u53ef\u53bb\u95f4\u65ad', '\u8df3\u8dc3\u95f4\u65ad']],
                ['\u5bfc\u6570\u4e0e\u5fae\u5206', ['\u5bfc\u6570', '\u5fae\u5206', "f'", 'dy/dx', '\u5207\u7ebf', '\u6cd5\u7ebf']],
                ['\u4e2d\u503c\u5b9a\u7406', ['\u7f57\u5c14\u5b9a\u7406', '\u62c9\u683c\u6717\u65e5\u4e2d\u503c\u5b9a\u7406', '\u67ef\u897f\u4e2d\u503c\u5b9a\u7406', '\u4e2d\u503c\u5b9a\u7406']],
                ['\u6d1b\u5fc5\u8fbe\u6cd5\u5219', ['\u6d1b\u5fc5\u8fbe', '0/0', '\u221e/\u221e', '\u672a\u5b9a\u5f0f']],
                ['\u5355\u8c03\u6027\u4e0e\u6781\u503c', ['\u5355\u8c03', '\u6781\u503c', '\u6700\u503c', '\u51f9\u51f8', '\u62d0\u70b9']],
                ['\u4e0d\u5b9a\u79ef\u5206', ['\u4e0d\u5b9a\u79ef\u5206', '\u6362\u5143\u79ef\u5206', '\u5206\u90e8\u79ef\u5206', '\u539f\u51fd\u6570']],
                ['\u5b9a\u79ef\u5206', ['\u5b9a\u79ef\u5206', '\\int', '\u79ef\u5206\u4e0a\u9650', '\u725b\u987f-\u83b1\u5e03\u5c3c\u8328', '\u5bf9\u79f0\u6027']],
                ['\u53cd\u5e38\u79ef\u5206', ['\u53cd\u5e38\u79ef\u5206', '\u7455\u79ef\u5206', '\u65e0\u7a77\u533a\u95f4', '\u6536\u655b']],
                ['\u5e42\u7ea7\u6570', ['\u5e42\u7ea7\u6570', '\u6536\u655b\u534a\u5f84', '\u6536\u655b\u57df', '\u6cf0\u52d2\u7ea7\u6570']],
                ['\u5e38\u6570\u9879\u7ea7\u6570', ['\u5e38\u6570\u9879\u7ea7\u6570', '\u6b63\u9879\u7ea7\u6570', '\u4ea4\u9519\u7ea7\u6570', '\u7edd\u5bf9\u6536\u655b']],
                ['\u504f\u5bfc\u6570\u4e0e\u5168\u5fae\u5206', ['\u504f\u5bfc', '\u5168\u5fae\u5206', '\u68af\u5ea6', '\u65b9\u5411\u5bfc\u6570']],
                ['\u591a\u5143\u51fd\u6570\u6781\u503c', ['\u591a\u5143\u6781\u503c', '\u6761\u4ef6\u6781\u503c', '\u62c9\u683c\u6717\u65e5\u4e58\u6570\u6cd5']],
                ['\u91cd\u79ef\u5206', ['\u4e8c\u91cd\u79ef\u5206', '\u4e09\u91cd\u79ef\u5206', '\u6781\u5750\u6807', '\u67f1\u5750\u6807', '\u7403\u5750\u6807']],
                ['\u66f2\u7ebf\u79ef\u5206', ['\u66f2\u7ebf\u79ef\u5206', '\u683c\u6797\u516c\u5f0f', '\u8def\u5f84\u65e0\u5173']],
                ['\u66f2\u9762\u79ef\u5206', ['\u66f2\u9762\u79ef\u5206', '\u9ad8\u65af\u516c\u5f0f', '\u65af\u6258\u514b\u65af\u516c\u5f0f']],
                ['\u5fae\u5206\u65b9\u7a0b', ['\u5fae\u5206\u65b9\u7a0b', '\u901a\u89e3', '\u7279\u89e3', '\u53ef\u5206\u79bb\u53d8\u91cf', '\u4e00\u9636\u7ebf\u6027']]
            ],
            linear: [
                ['\u884c\u5217\u5f0f\u8ba1\u7b97', ['\u884c\u5217\u5f0f', '|A|', 'det', '\u4f59\u5b50\u5f0f', '\u4ee3\u6570\u4f59\u5b50\u5f0f']],
                ['\u77e9\u9635\u8fd0\u7b97', ['\u77e9\u9635', '\u8f6c\u7f6e', '\u4f34\u968f\u77e9\u9635', '\u521d\u7b49\u77e9\u9635', '\u8ff9']],
                ['\u9006\u77e9\u9635', ['\u9006\u77e9\u9635', '\u53ef\u9006', 'A^{-1}', '\u521d\u7b49\u53d8\u6362']],
                ['\u77e9\u9635\u79e9', ['\u79e9', 'rank', '\u5217\u79e9', '\u884c\u79e9', '\u6781\u5927\u65e0\u5173\u7ec4']],
                ['\u5411\u91cf\u7ec4\u76f8\u5173\u6027', ['\u5411\u91cf\u7ec4', '\u7ebf\u6027\u76f8\u5173', '\u7ebf\u6027\u65e0\u5173', '\u7ebf\u6027\u8868\u793a']],
                ['\u7ebf\u6027\u65b9\u7a0b\u7ec4', ['\u65b9\u7a0b\u7ec4', 'Ax=0', 'Ax=b', '\u57fa\u7840\u89e3\u7cfb', '\u901a\u89e3']],
                ['\u7279\u5f81\u503c\u4e0e\u7279\u5f81\u5411\u91cf', ['\u7279\u5f81\u503c', '\u7279\u5f81\u5411\u91cf', '\u7279\u5f81\u591a\u9879\u5f0f']],
                ['\u76f8\u4f3c\u4e0e\u5bf9\u89d2\u5316', ['\u76f8\u4f3c', '\u5bf9\u89d2\u5316', '\u76f8\u4f3c\u77e9\u9635', '\u53ef\u5bf9\u89d2\u5316']],
                ['\u4e8c\u6b21\u578b\u6807\u51c6\u5316', ['\u4e8c\u6b21\u578b', '\u6807\u51c6\u5f62', '\u89c4\u8303\u5f62', '\u914d\u65b9\u6cd5', '\u6b63\u4ea4\u53d8\u6362']],
                ['\u6b63\u5b9a\u77e9\u9635', ['\u6b63\u5b9a', '\u987a\u5e8f\u4e3b\u5b50\u5f0f', '\u60ef\u6027\u6307\u6570']],
                ['\u7ebf\u6027\u7a7a\u95f4\u4e0e\u57fa', ['\u7ebf\u6027\u7a7a\u95f4', '\u57fa', '\u7ef4\u6570', '\u5750\u6807']],
                ['\u6b63\u4ea4\u6027', ['\u6b63\u4ea4', '\u6b63\u4ea4\u77e9\u9635', '\u65bd\u5bc6\u7279\u6b63\u4ea4\u5316']]
            ],
            probability: [
                ['\u53e4\u5178\u6982\u7387', ['\u53e4\u5178\u6982\u7387', '\u6837\u672c\u7a7a\u95f4', '\u6392\u5217', '\u7ec4\u5408']],
                ['\u6761\u4ef6\u6982\u7387\u4e0e\u72ec\u7acb\u6027', ['\u6761\u4ef6\u6982\u7387', '\u72ec\u7acb', '\u4e92\u65a5', '\u5168\u6982\u7387', '\u8d1d\u53f6\u65af']],
                ['\u4e00\u7ef4\u968f\u673a\u53d8\u91cf', ['\u968f\u673a\u53d8\u91cf', '\u5206\u5e03\u51fd\u6570', '\u5206\u5e03\u5f8b', '\u5bc6\u5ea6\u51fd\u6570']],
                ['\u591a\u7ef4\u968f\u673a\u53d8\u91cf', ['\u4e8c\u7ef4\u968f\u673a\u53d8\u91cf', '\u8054\u5408\u5206\u5e03', '\u8fb9\u7f18\u5206\u5e03', '\u6761\u4ef6\u5206\u5e03']],
                ['\u5e38\u89c1\u5206\u5e03', ['\u4e8c\u9879\u5206\u5e03', '\u6cca\u677e\u5206\u5e03', '\u6b63\u6001\u5206\u5e03', '\u6307\u6570\u5206\u5e03', 'B(', 'P(', 'N(', 'Exp']],
                ['\u6570\u5b66\u671f\u671b', ['\u671f\u671b', '\u6570\u5b66\u671f\u671b', 'E(', '\u968f\u673a\u53d8\u91cf\u51fd\u6570']],
                ['\u65b9\u5dee\u4e0e\u534f\u65b9\u5dee', ['\u65b9\u5dee', '\u6807\u51c6\u5dee', '\u534f\u65b9\u5dee', '\u76f8\u5173\u7cfb\u6570', 'D(']],
                ['\u5927\u6570\u5b9a\u5f8b', ['\u5927\u6570\u5b9a\u5f8b', '\u5207\u6bd4\u96ea\u592b', '\u4f9d\u6982\u7387\u6536\u655b']],
                ['\u4e2d\u5fc3\u6781\u9650\u5b9a\u7406', ['\u4e2d\u5fc3\u6781\u9650\u5b9a\u7406', 'CLT', '\u6807\u51c6\u5316', '\u6b63\u6001\u8fd1\u4f3c']],
                ['\u53c2\u6570\u70b9\u4f30\u8ba1', ['\u77e9\u4f30\u8ba1', '\u6781\u5927\u4f3c\u7136', '\u65e0\u504f\u4f30\u8ba1', '\u6709\u6548\u6027']],
                ['\u533a\u95f4\u4f30\u8ba1', ['\u7f6e\u4fe1\u533a\u95f4', '\u7f6e\u4fe1\u5ea6', '\u4f30\u8ba1\u533a\u95f4']],
                ['\u5047\u8bbe\u68c0\u9a8c', ['\u5047\u8bbe\u68c0\u9a8c', '\u663e\u8457\u6027', 'p \u503c', '\u62d2\u7edd\u57df', 't \u68c0\u9a8c']]
            ]
        };

        function mergeTopicRules(base = {}, extra = extendedTopicRules) {
            const merged = {};
            const subjects = new Set([...Object.keys(base || {}), ...Object.keys(extra || {})]);
            subjects.forEach(subject => {
                const byTopic = new Map();
                [...(base?.[subject] || []), ...(extra?.[subject] || [])].forEach(pair => {
                    const topic = String(pair?.[0] || '').trim();
                    if (!topic) return;
                    const words = Array.isArray(pair?.[1]) ? pair[1].map(String) : [];
                    const existing = byTopic.get(topic) || [];
                    byTopic.set(topic, Array.from(new Set([...existing, ...words])));
                });
                merged[subject] = Array.from(byTopic.entries());
            });
            return merged;
        }

        const AudioEngine = {
            ctx: null,
            masterGain: null,
            activeNodes: [],
            generation: 0,

            init() {
                if (!this.ctx) {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (!AC) return false;
                    this.ctx = new AC();
                    this.masterGain = this.ctx.createGain();
                    this.masterGain.connect(this.ctx.destination);
                }
                if (this.ctx.state === 'suspended') this.ctx.resume();
                this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
                this.masterGain.gain.setValueAtTime(settings.sound.volume, this.ctx.currentTime);
                return true;
            },

            cleanup(token = this.generation) {
                if (token !== this.generation) return;
                this.activeNodes.forEach(node => {
                    try { if (node.stop) node.stop(); } catch (e) {}
                    try { if (node.disconnect) node.disconnect(); } catch (e) {}
                    if (node._interval) clearInterval(node._interval);
                });
                this.activeNodes = [];
            },

            setVolume(target, duration = 0.5) {
                if (!this.masterGain || !this.ctx) return;
                const now = this.ctx.currentTime;
                this.masterGain.gain.cancelScheduledValues(now);
                this.masterGain.gain.setTargetAtTime(Math.max(0.0001, target), now, duration / 3);
            },

            fadeOut(duration = 2, token = this.generation) {
                return new Promise(resolve => {
                    if (!this.masterGain || !this.ctx) { resolve(); return; }
                    const now = this.ctx.currentTime;
                    this.masterGain.gain.cancelScheduledValues(now);
                    this.masterGain.gain.setTargetAtTime(0.0001, now, duration / 3);
                    setTimeout(() => { this.cleanup(token); resolve(); }, duration * 1000);
                });
            }
        };

        function playBrownNoise() {
            if (!AudioEngine.init()) return;
            AudioEngine.cleanup();
            const ctx = AudioEngine.ctx;
            const bufferSize = 2 * ctx.sampleRate;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = settings.sound.brownFilter || 400;
            filter.Q.value = 0.5;
            noise.connect(filter);
            filter.connect(AudioEngine.masterGain);
            noise.start();
            AudioEngine.activeNodes.push(noise, filter);
            AudioEngine.setVolume(settings.sound.volume, 0.5);
        }

        function playBinauralBeats() {
            if (!AudioEngine.init()) return;
            AudioEngine.cleanup();
            const ctx = AudioEngine.ctx;
            const base = settings.sound.binauralBase || 200;
            const beat = settings.sound.binauralFreq || 40;
            const leftOsc = ctx.createOscillator();
            const rightOsc = ctx.createOscillator();
            leftOsc.type = 'sine';
            rightOsc.type = 'sine';
            leftOsc.frequency.value = base;
            rightOsc.frequency.value = base + beat;
            const leftGain = ctx.createGain();
            const rightGain = ctx.createGain();
            leftGain.gain.value = 0.5;
            rightGain.gain.value = 0.5;
            const merger = ctx.createChannelMerger(2);
            leftOsc.connect(leftGain);
            rightOsc.connect(rightGain);
            leftGain.connect(merger, 0, 0);
            rightGain.connect(merger, 0, 1);
            merger.connect(AudioEngine.masterGain);
            leftOsc.start();
            rightOsc.start();
            AudioEngine.activeNodes.push(leftOsc, rightOsc, leftGain, rightGain, merger);
            AudioEngine.setVolume(settings.sound.volume * 0.8, 0.5);
        }

        function playAmbientDrone() {
            if (!AudioEngine.init()) return;
            AudioEngine.cleanup();
            const ctx = AudioEngine.ctx;
            const voices = Math.max(1, Math.min(8, settings.sound.ambientVoices || 4));
            const baseFreq = 120;
            for (let i = 0; i < voices; i++) {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = baseFreq * (1 + i * 0.25);
                const lfo = ctx.createOscillator();
                lfo.type = 'sine';
                lfo.frequency.value = 0.02 + Math.random() * 0.03;
                const lfoGain = ctx.createGain();
                lfoGain.gain.value = 2;
                const voiceGain = ctx.createGain();
                voiceGain.gain.value = 1 / voices;
                lfo.connect(lfoGain);
                lfoGain.connect(osc.frequency);
                osc.connect(voiceGain);
                voiceGain.connect(AudioEngine.masterGain);
                osc.start();
                lfo.start();
                AudioEngine.activeNodes.push(osc, lfo, lfoGain, voiceGain);
            }
            AudioEngine.setVolume(settings.sound.volume, 1);
        }

        function playLoFiMinimal() {
            if (!AudioEngine.init()) return;
            AudioEngine.cleanup();
            const ctx = AudioEngine.ctx;
            const chord = [220, 261.63, 293.66, 329.63];
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 600;
            filter.Q.value = 0.5;

            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = chord[0];
            const gain = ctx.createGain();
            gain.gain.value = 0.6;
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(AudioEngine.masterGain);
            osc.start();
            AudioEngine.activeNodes.push(osc, filter, gain);

            let index = 0;
            const intervalId = setInterval(() => {
                if (!AudioEngine.ctx) { clearInterval(intervalId); return; }
                index = (index + 1) % chord.length;
                osc.frequency.setTargetAtTime(chord[index], AudioEngine.ctx.currentTime, 0.5);
            }, 8000);
            osc._interval = intervalId;
            AudioEngine.setVolume(settings.sound.volume * 0.6, 1);
        }

        async function startSound(options = {}) {
            if (!settings.sound.enabled) return;
            if (state.isPlaying && state.currentMode === settings.sound.mode && !options.force) {
                if (AudioEngine.init()) AudioEngine.setVolume(settings.sound.volume, 0.12);
                return;
            }
            AudioEngine.generation++;
            if (!AudioEngine.init()) return;
            AudioEngine.cleanup(AudioEngine.generation);
            switch (settings.sound.mode) {
                case 'binaural': playBinauralBeats(); break;
                case 'ambient': playAmbientDrone(); break;
                case 'lofi': playLoFiMinimal(); break;
                case 'brown':
                default: playBrownNoise(); break;
            }
            state.isPlaying = true;
            state.currentMode = settings.sound.mode;
        }

        async function stopSound() {
            const token = ++AudioEngine.generation;
            state.isPlaying = false;
            state.currentMode = null;
            await AudioEngine.fadeOut(2, token);
        }

        function adaptSoundToDifficulty(difficulty) {
            if (!settings.sound.adaptiveVolume) return;
            if (difficulty >= 8) {
                AudioEngine.setVolume(settings.sound.volume * 0.6, 2);
            } else {
                AudioEngine.setVolume(settings.sound.volume, 2);
            }
        }

        function adaptSoundToErrors() {
            if (!settings.sound.adaptiveVolume) return;
            const recent = state.answers.slice(-2);
            if (recent.length >= 2 && recent.every(a => !a.correct)) {
                settings.sound.mode = 'brown';
                animateSettingsContentChange(applySoundSettings);
                updateQuizSoundUI();
                startSound();
                AudioEngine.setVolume(settings.sound.volume * 0.5, 2);
            }
        }

        function restartSoundIfNeeded() {
            if (settings.sound.enabled && state.isPlaying) {
                startSound();
            }
        }

        function groupedQuestionDB(data) {
            const grouped = data.questionDB ? { ...data.questionDB } : {};
            if (!Object.keys(grouped).length && Array.isArray(data.questions)) {
                data.questions.forEach(({ subject, ...q }) => {
                    if (!grouped[subject]) grouped[subject] = [];
                    grouped[subject].push(q);
                });
            }
            return grouped;
        }

        function clearQuestionRuntimeCache() {
            try { Object.keys(questionListCache).forEach(key => delete questionListCache[key]); } catch (_) {}
            bankListCache.clear();
            bankTopicCache.clear();
            bankIndexCache.clear();
            bankPageCache.clear();
            questionInfoCache.clear();
            questionBankRevision++;
        }

        async function loadQuestionIndex({ force = false } = {}) {
            if (questionIndexRequest && !force) return questionIndexRequest;
            questionIndexRequest = (async () => {
                try {
                    const response = await fetch(apiUrl('/api/question-index'));
                    const result = await response.json();
                    if (result.ok) {
                        backendQuestionIndex = {
                            revision: result.revision || '',
                            index: result.index || {},
                            filters: result.filters || {}
                        };
                        bankTopicCache.clear();
                        bankIndexCache.clear();
                        bankListCache.clear();
                        bankPageCache.clear();
                        if ($('bankScreen')?.classList.contains('active')) renderBank();
                    }
                    return result;
                } catch (error) {
                    console.warn('Question index load failed', error);
                    return null;
                } finally {
                    questionIndexRequest = null;
                }
            })();
            return questionIndexRequest;
        }

        function applyQuestionBankData(data, { expandGenerated = false } = {}) {
            const meta = { ...fallbackQuestionMeta, ...(data.meta || {}) };
            meta.subjects = { ...fallbackQuestionMeta.subjects, ...(data.meta?.subjects || {}) };
            meta.topicRules = mergeTopicRules({ ...fallbackQuestionMeta.topicRules, ...(data.meta?.topicRules || {}) });
            subjectNames = data.subjectNames || Object.fromEntries(Object.entries(meta.subjects).map(([key, value]) => [key, value.name]));
            subjectColors = data.subjectColors || Object.fromEntries(Object.entries(meta.subjects).map(([key, value]) => [key, value.color]));
            topicRules = mergeTopicRules(data.topicRules || meta.topicRules || {});
            questionDB = groupedQuestionDB(data);
            subjectKeys().forEach(subject => { if (!questionDB[subject]) questionDB[subject] = []; });
            const seedQuestions = Array.isArray(data.questions) ? data.questions : Object.entries(questionDB).flatMap(([subject, list]) => list.map(q => ({ ...q, subject })));
            const last = seedQuestions[seedQuestions.length - 1];
            questionBankSeed = `${meta.version || 'api'}:${seedQuestions.length}:${last?.id || ''}`;
            if (expandGenerated && databaseReady) {
                subjectKeys().forEach(subject => {
                    questionDB[subject] = buildSubjectQuestions(subject);
                });
            }
            clearQuestionRuntimeCache();
            return data;
        }

        function readQuestionBankCache(allowExpired = false) {
            try {
                const cached = JSON.parse(sessionStorage.getItem(questionBankCacheKey) || 'null');
                if (!cached?.data) return null;
                if (!allowExpired && Date.now() - Number(cached.at || 0) > questionBankCacheMs) return null;
                return cached.data;
            } catch (_) {
                return null;
            }
        }

        function writeQuestionBankCache(data) {
            try {
                sessionStorage.setItem(questionBankCacheKey, JSON.stringify({ at: Date.now(), data }));
            } catch (_) {}
        }

        // Load question-bank data via API.
        async function loadQuestionBank({ force = false, expandGenerated = false, useCache = true } = {}) {
            if (useCache && !force) {
                const cached = readQuestionBankCache();
                if (cached) return applyQuestionBankData(cached, { expandGenerated });
            }
            if (questionBankRequest && !force) return questionBankRequest;
            questionBankRequest = (async () => {
            try {
                const response = await fetch(apiUrl('/api/questions'));
                const result = await response.json();
                if (result.ok && result.data) {
                    writeQuestionBankCache(result.data);
                    applyQuestionBankData(result.data, { expandGenerated });
                    loadQuestionIndex({ force }).catch(() => {});
                    console.log('\u9898\u5e93\u6570\u636e\u52a0\u8f7d\u6210\u529f');
                    return result.data;
                } else {
                    console.error('\u9898\u5e93\u6570\u636e\u52a0\u8f7d\u5931\u8d25:', result.error);
                }
            } catch (error) {
                console.error('\u9898\u5e93\u6570\u636e\u52a0\u8f7d\u5f02\u5e38:', error);
                const cached = readQuestionBankCache(true);
                if (cached) return applyQuestionBankData(cached, { expandGenerated });
            }
            const fallback = applyQuestionBankData({ meta: fallbackQuestionMeta, questions: [] }, { expandGenerated: true });
            ensureLocalQuestionBankReady();
            return fallback;
            })();
            try {
                return await questionBankRequest;
            } finally {
                questionBankRequest = null;
            }
        }

        async function loadQuestionMeta() {
            try {
                const response = await fetch(apiUrl('/api/question-meta'));
                const result = await response.json();
                if (result.ok) {
                    const data = {
                        meta: result.meta,
                        subjectNames: result.subjectNames,
                        subjectColors: result.subjectColors,
                        topicRules: result.topicRules,
                        questions: []
                    };
                    applyQuestionBankData(data, { expandGenerated: false });
                    return data;
                }
            } catch (error) {
                console.warn('Question meta load failed', error);
            }
            const fallback = applyQuestionBankData({ meta: fallbackQuestionMeta, questions: [] });
            ensureLocalQuestionBankReady();
            return fallback;
        }

        async function ensureSubjectQuestions(subject, minCount = 1) {
            const current = questionDB[subject] || [];
            if (current.length >= minCount) return current;
            try {
                const res = await fetch(apiUrl(`/api/questions/${encodeURIComponent(subject)}`));
                const data = await res.json();
                if (data.ok && Array.isArray(data.questions) && data.questions.length >= current.length) {
                    questionDB[subject] = data.questions.map(q => ({ ...q, subject: q.subject || subject }));
                    Object.keys(questionListCache).forEach(key => { if (key.startsWith(`${subject}:`)) delete questionListCache[key]; });
                    return questionDB[subject];
                }
            } catch (error) {
                console.warn('Subject question load failed', error);
            }
            if ((questionDB[subject] || []).length < minCount) {
                questionDB[subject] = buildSubjectQuestions(subject);
                Object.keys(questionListCache).forEach(key => { if (key.startsWith(`${subject}:`)) delete questionListCache[key]; });
            }
            return questionDB[subject] || [];
        }

        async function syncQuestionToServer(q) {
            try {
                await fetch(apiUrl('/api/questions'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(q)
                });
                sessionStorage.removeItem(questionBankCacheKey);
            } catch (error) {
                console.log('Question sync skipped while offline');
            }
        }

        async function callOllamaJson(prompt) {
            const base = (settings.ollamaBaseUrl || 'http://localhost:11434').replace(/\/$/, '');
            const model = settings.ollamaModel || settings.browserModel || 'qwen2.5';
            const res = await fetch(`${base}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, prompt, stream: false, format: 'json' })
            });
            if (!res.ok) throw new Error(`ollama ${res.status}`);
            const data = await res.json();
            return JSON.parse(data.response || '{}');
        }

        async function callBrowserModelJson(prompt) {
            if (!('gpu' in navigator)) throw new Error('WebGPU unavailable');
            const runtime = window.ai || window.LanguageModel || null;
            if (!runtime) throw new Error('browser model runtime unavailable');
            let session = null;
            if (runtime.languageModel?.create) session = await runtime.languageModel.create({ systemPrompt: 'Only output valid JSON.' });
            else if (runtime.createTextSession) session = await runtime.createTextSession();
            else if (runtime.create) session = await runtime.create();
            if (!session?.prompt) throw new Error('browser model session unavailable');
            const raw = String(await session.prompt(prompt) || '');
            const start = raw.indexOf('{');
            const end = raw.lastIndexOf('}');
            if (start < 0 || end <= start) throw new Error('browser model returned non-json');
            return JSON.parse(raw.slice(start, end + 1));
        }

        async function callConfiguredLocalJson(prompt) {
            if (!settings.useLocalModel) return null;
            try {
                if (settings.localModelType === 'ollama') return await callOllamaJson(prompt);
                return await callBrowserModelJson(prompt);
            } catch (error) {
                console.warn('Local model unavailable; falling back', error);
                return null;
            }
        }

        function getSubjectName(subject) {
            return subjectNames[subject] || fallbackQuestionMeta.subjects?.[subject]?.name || subject || '\u672a\u5206\u7c7b';
        }

        function subjectKeys() {
            const keys = Object.keys(subjectNames || {});
            return keys.length ? keys : Object.keys(fallbackQuestionMeta.subjects || {});
        }

        function getSubjectColor(subject) {
            return subjectColors[subject] || fallbackQuestionMeta.subjects?.[subject]?.color || '#64748B';
        }

        const genericQuestionTypes = new Set(['选择题', '填空题', '计算题', '证明题', '综合题', '应用题', 'choice', 'fill']);
        const commonMathTerms = new Set([
            '函数', '极限', '连续', '导数', '微分', '积分', '定积分', '不定积分', '级数', '收敛', '发散', '偏导', '梯度', '曲线', '曲面', '微分方程',
            '无穷小', '等价无穷小', '中值定理', '泰勒公式', '多元函数', '二重积分', '三重积分', '曲线积分', '曲面积分',
            '矩阵', '行列式', '向量', '线性相关', '线性无关', '秩', '特征值', '特征向量', '相似', '对角化', '二次型', '正定', '方程组',
            '概率', '独立', '互斥', '分布', '期望', '方差', '协方差', '相关系数', '大数定律', '中心极限定理', '估计', '矩估计', '似然', '检验', '置信区间',
            'lim', 'det', 'rank', 'trace', 'CLT', 'Ax=0', '|A|', 'B(', 'N(', 'P(', 'E(', 'D(', 'Exp', 'U('
        ]);

        function allowedMathTerms(subject) {
            const set = new Set(commonMathTerms);
            Object.values(topicRules || {}).flat().forEach(([topic, words]) => {
                if (topic) set.add(String(topic));
                (words || []).forEach(word => set.add(String(word)));
            });
            (topicRules[subject] || []).forEach(([topic, words]) => {
                if (topic) set.add(String(topic));
                (words || []).forEach(word => set.add(String(word)));
            });
            return set;
        }

        function sanitizeMathKeyword(keyword, subject, sourceText = '') {
            const text = String(sourceText || '');
            const value = String(keyword || '').trim().replace(/[\s,.!?;:()[\]{}\"'`\uFF0C\u3002\uFF01\uFF1F\uFF1B\uFF1A\uFF08\uFF09\u3010\u3011\u300A\u300B\u3001]/g, '');
            if (!value || value.length > 12) return '';
            if (stopWords.has(value) || genericQuestionTypes.has(value)) return '';
            if (/^[\d\s.+\-*/=<>≤≥]+$/.test(value)) return '';
            if (/^[\u4e00-\u9fa5]$/.test(value) || /^[A-Za-z]$/.test(value)) return '';
            const allowed = allowedMathTerms(subject);
            return allowed.has(value) ? value : '';
        }

        function sanitizeMathKeywords(keywords, subject, sourceText = '', limit = 5, exclude = '') {
            const out = [];
            (keywords || []).forEach(keyword => {
                const clean = sanitizeMathKeyword(keyword, subject, sourceText);
                if (clean && clean !== exclude && !out.includes(clean)) out.push(clean);
            });
            return out.slice(0, limit);
        }

        function sanitizeMathTopic(topic, subject, questionType = 'fill') {
            const value = String(topic || '').trim();
            const valid = new Set((topicRules[subject] || []).map(([name]) => name));
            if (valid.has(value)) return value;
            if (commonMathTerms.has(value) && !genericQuestionTypes.has(value)) return value;
            return questionType === 'choice' ? '\u9009\u62e9\u9898' : '\u586b\u7a7a\u9898';
        }

        function rankedTopicMatches(text, subject) {
            const source = String(text || '');
            return (topicRules[subject] || []).map(([topic, words]) => {
                const found = (words || []).filter(word => word && source.includes(String(word)));
                const score = found.length * 100 + found.reduce((sum, word) => sum + String(word).length, 0) * 3 + String(topic || '').length;
                return { topic, found, score };
            }).filter(item => item.found.length).sort((a, b) => b.score - a.score);
        }

        function classifyQuestion(q) {
            const cacheKey = `${q.subject || ''}:${q.id || normalizeStem(q.question).slice(0, 80)}:${questionBankRevision}`;
            if (questionInfoCache.has(cacheKey)) return questionInfoCache.get(cacheKey);
            let result;
            const text = `${q.question} ${(q.options || []).join(' ')} ${q.explanation || ''}`;
            if (q.meta && (Array.isArray(q.meta.keywords) || q.meta.type || Array.isArray(q.meta.knowledge_path))) {
                const pathTopic = q.meta.knowledge_path?.filter(Boolean).at(-1);
                const rawTopic = (pathTopic && pathTopic !== '待标注')
                    ? pathTopic
                    : (q.meta.type && !genericQuestionTypes.has(q.meta.type) ? q.meta.type : '');
                const topic = sanitizeMathTopic(rawTopic, q.subject, q.type);
                let keywords = Array.isArray(q.meta.keywords) ? q.meta.keywords.slice(0, 5) : [];
                if (!keywords.length && topicRules[q.subject]) {
                    const matchedWords = [];
                    const topicPair = (topicRules[q.subject] || []).find(([t]) => t === topic);
                    (topicPair?.[1] || []).forEach(word => { if (text.includes(word)) matchedWords.push(word); });
                    if (!matchedWords.length) matchedWords.push(...(rankedTopicMatches(text, q.subject)[0]?.found || []));
                    keywords = [...new Set(matchedWords)].slice(0, 5);
                }
                keywords = sanitizeMathKeywords(keywords, q.subject, text, 5, topic);
                result = { topic, keywords };
                questionInfoCache.set(cacheKey, result);
                return result;
            }
            const ranked = rankedTopicMatches(text, q.subject);
            const topic = sanitizeMathTopic(ranked[0]?.topic, q.subject, q.type);
            const keywords = sanitizeMathKeywords([...new Set(ranked.flatMap(item => item.found))], q.subject, text, 5, topic);
            result = { topic, keywords };
            questionInfoCache.set(cacheKey, result);
            return result;
        }

        function topicKey(subject, topic) {
            return `${subject}::${topic}`;
        }

        function questionKey(q) {
            return `${q.subject || state.subject}::${q.id || normalizeStem(q.question).slice(0, 64)}`;
        }

        function questionAttemptPayload() {
            const out = {};
            Object.entries(state.questionAttemptCounts || {}).forEach(([key, count]) => {
                out[key] = {
                    count: Number(count) || 0,
                    lastCorrect: state.questionLastCorrect?.[key] === true,
                    score: Math.max(0, Math.min(100, Number(state.questionAccuracyScores?.[key] || 0)))
                };
            });
            return out;
        }

        function bankRemoteKeyFor(subject, search, filters, page) {
            const filterKey = (Array.isArray(filters) ? filters : []).slice().sort().join(',');
            return `${bankRemoteMeta.revision || backendQuestionIndex.revision || 'pending'}:${subject}:${String(search || '').trim().toLowerCase()}:${filterKey}:${bankPageSize()}:${page}`;
        }

        function bankRemoteMetaKeyFor(subject, search, filters) {
            const filterKey = (Array.isArray(filters) ? filters : []).slice().sort().join(',');
            return `${subject}:${String(search || '').trim().toLowerCase()}:${filterKey}:${bankPageSize()}`;
        }

        function bankRemoteKey(page = state.bankPage) {
            return bankRemoteKeyFor(state.bankSubject, state.bankSearch, state.bankTopicFilters, page);
        }

        function currentBankRemoteMeta() {
            return bankRemoteMetaCache.get(bankRemoteMetaKeyFor(state.bankSubject, state.bankSearch, state.bankTopicFilters)) || null;
        }

        function captureBankScrollAnchor() {
            return { top: window.scrollY };
        }

        function restoreBankScrollAnchor(anchor) {
            const apply = () => {
                const y = Number(anchor?.top) || 0;
                window.scrollTo({ top: y, behavior: 'auto' });
            };
            apply();
            requestAnimationFrame(() => {
                apply();
                setTimeout(apply, 120);
            });
        }

        function statPack(answered = 0, correct = 0, levelSum = 0) {
            const accuracy = answered ? Math.round(correct / answered * 100) : 0;
            const avgLevel = answered ? (levelSum / answered).toFixed(1) : '0.0';
            return { answered, correct, accuracy, avgLevel };
        }

        function pieStyle(items) {
            const total = items.reduce((sum, item) => sum + item.value, 0);
            if (!total) return 'conic-gradient(#E2E8F0 0 100%)';
            let cursor = 0;
            const parts = items.map(item => {
                const start = cursor;
                cursor += item.value / total * 100;
                return `${item.color} ${start}% ${cursor}%`;
            });
            return `conic-gradient(${parts.join(', ')})`;
        }

        const topicPalette = ['#1B6B93', '#4FCCA3', '#A18CD1', '#F5A623', '#F47068', '#0EA5E9', '#22C55E', '#8B5CF6', '#EC4899', '#14B8A6', '#EAB308', '#6366F1'];

        // Compute question-bank coverage data: unique answered/correct question
        // counts at the total, per-subject and per-topic levels, plus the bank
            // totals used as denominators for answer rate.
        function computeCoverage() {
            const bankByKey = {};
            const subjectTotals = { calculus: 0, linear: 0, probability: 0 };
            const topicTotals = {};
            subjectKeys().forEach(subject => {
                getAllQuestions(subject).forEach(q => {
                    const key = `${subject}::${q.id}`;
                    bankByKey[key] = q;
                    subjectTotals[subject]++;
                    const topic = classifyQuestion(q).topic;
                    const tk = `${subject}::${topic}`;
                    topicTotals[tk] = (topicTotals[tk] || 0) + 1;
                });
            });
            const answeredKeys = Object.keys(state.answeredQuestionKeys || {});
            const correctKeys = Object.keys(state.correctQuestionKeys || {});
            const subjectAnswered = { calculus: 0, linear: 0, probability: 0 };
            const subjectCorrect = { calculus: 0, linear: 0, probability: 0 };
            const topicAnswered = {};
            const topicCorrect = {};
            answeredKeys.forEach(key => {
                const subject = key.split('::')[0];
                if (subjectAnswered[subject] !== undefined) subjectAnswered[subject]++;
                const q = bankByKey[key];
                if (q) {
                    const tk = `${q.subject}::${classifyQuestion(q).topic}`;
                    topicAnswered[tk] = (topicAnswered[tk] || 0) + 1;
                }
            });
            correctKeys.forEach(key => {
                const subject = key.split('::')[0];
                if (subjectCorrect[subject] !== undefined) subjectCorrect[subject]++;
                const q = bankByKey[key];
                if (q) {
                    const tk = `${q.subject}::${classifyQuestion(q).topic}`;
                    topicCorrect[tk] = (topicCorrect[tk] || 0) + 1;
                }
            });
            return { subjectTotals, topicTotals, subjectAnswered, subjectCorrect, topicAnswered, topicCorrect, answeredKeys, correctKeys };
        }

        function renderLineChart(title, labels, series, yLabel, yMax) {
            const W = 800, H = 180;
            const mL = 42, mR = 10, mT = 10, mB = 30;
            const pW = W - mL - mR;
            const pH = H - mT - mB;
            const n = labels.length;
            let autoMax = yMax;
            if (autoMax == null) {
                autoMax = 0;
                series.forEach(s => s.data.forEach(v => { if (v != null && v > autoMax) autoMax = v; }));
                if (autoMax === 0) autoMax = 10;
                autoMax = Math.ceil(autoMax / 10) * 10 || 10;
            }
            const xAt = i => n <= 1 ? mL + pW / 2 : mL + (i / (n - 1)) * pW;
            const yAt = v => mT + pH - (v / autoMax) * pH;
            const gridCount = 5;
            let gridSvg = '';
            for (let i = 0; i <= gridCount; i++) {
                const y = mT + (i / gridCount) * pH;
                const val = Math.round(autoMax - (i / gridCount) * autoMax);
                gridSvg += `<line x1="${mL}" y1="${y}" x2="${W - mR}" y2="${y}" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="4 4"/>`;
                gridSvg += `<text x="${mL - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#64748B">${val}</text>`;
            }
            let xLabels = '';
            labels.forEach((lab, i) => {
                const x = xAt(i);
                if (i % 2 === 0 || i === n - 1) {
                    xLabels += `<text x="${x}" y="${H - mB + 16}" text-anchor="middle" font-size="10" fill="#64748B">${lab}</text>`;
                }
            });
            const yLabelSvg = `<text x="10" y="${mT + pH / 2}" text-anchor="middle" font-size="11" fill="#475569" font-weight="800" transform="rotate(-90 10 ${mT + pH / 2})">${yLabel}</text>`;
            let seriesSvg = '';
            series.forEach(s => {
                const segs = [];
                let cur = [];
                s.data.forEach((v, i) => {
                    if (v == null) {
                        if (cur.length) segs.push(cur);
                        cur = [];
                    } else {
                        cur.push(`${xAt(i)},${yAt(v)}`);
                    }
                });
                if (cur.length) segs.push(cur);
                segs.forEach(seg => {
                    if (seg.length >= 2) {
                        seriesSvg += `<polyline points="${seg.join(' ')}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
                    }
                    seg.forEach(pt => {
                        const [px, py] = pt.split(',').map(Number);
                        seriesSvg += `<circle cx="${px}" cy="${py}" r="3" fill="${s.color}" stroke="white" stroke-width="1"/>`;
                    });
                });
            });
            const legend = `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:12px;font-weight:800;">${series.map(s => `<span style="display:inline-flex;align-items:center;gap:4px;"><i style="width:10px;height:10px;border-radius:50%;display:inline-block;background:${s.color};"></i>${s.name}</span>`).join('')}</div>`;
            return `<div class="line-chart-wrap"><svg viewBox="0 0 ${W} ${H}" style="width:100%;height:180px;">${gridSvg}${xLabels}${yLabelSvg}${seriesSvg}</svg>${legend}</div>`;
        }

        function renderStatsScreen() {
            const content = $('statsContent');
            if (!content) return;
            const all = statPack(state.allModeStats.answered || state.totalAnswered, state.allModeStats.correct || state.totalCorrect, state.allModeStats.levelSum || 0);
            const def = statPack(state.defaultAnswered, state.defaultCorrect, Object.values(state.perSubject).reduce((sum, item) => sum + (item.levelSum || 0), 0));
            const cov = computeCoverage();
            const totalQuestions = Object.values(cov.subjectTotals).reduce((a, b) => a + b, 0);
            const totalRate = totalQuestions ? Math.round(cov.answeredKeys.length / totalQuestions * 100) : 0;
            const totalCorrectRate = totalQuestions ? Math.round(cov.correctKeys.length / totalQuestions * 100) : 0;
            const recent = state.recentPractice.filter(item => Date.now() - new Date(item.at).getTime() <= Math.min(30, settings.statsTrendDays || 14) * 86400000);
            const subjectKeysForStats = Object.keys(fallbackQuestionMeta.subjects || {});
            const subjectRecent = subjectKeysForStats.map(subject => ({ label: getSubjectName(subject), value: recent.filter(item => item.subject === subject).length, color: getSubjectColor(subject) }));
            const topicRecent = {};
            recent.forEach(item => {
                const key = `${getSubjectName(item.subject)} / ${item.topic}`;
                topicRecent[key] = (topicRecent[key] || 0) + 1;
            });
            const topicPieItems = Object.entries(topicRecent).slice(0, 8).map(([label, value], index) => ({ label, value, color: topicPalette[index % topicPalette.length] }));
            const topicRows = Object.entries(state.topicStats || {}).map(([key, stat]) => {
                const [subject, topic] = key.split('::');
                return { subject, topic, label: `${getSubjectName(subject)} / ${topic}`, answered: stat.answered || 0, correct: stat.correct || 0 };
            }).sort((a, b) => b.answered - a.answered);
            const subjectRows = subjectKeys().map(subject => {
                const d = state.allSubjectStats[subject] || {};
                const pack = statPack(d.answered || state.perSubject[subject]?.answered || 0, d.correct || state.perSubject[subject]?.correct || 0, d.levelSum || state.perSubject[subject]?.levelSum || 0);
                return `<tr><td>${getSubjectName(subject)}</td><td>${pack.answered}</td><td>${pack.correct}</td><td>${pack.accuracy}%</td><td>L${pack.avgLevel}</td></tr>`;
            }).join('');
            const defaultSubjectRows = subjectKeys().map(subject => {
                const d = state.perSubject[subject] || {};
                const pack = statPack(d.answered || 0, d.correct || 0, d.levelSum || 0);
                return `<tr><td>${getSubjectName(subject)}</td><td>${pack.answered}</td><td>${pack.correct}</td><td>${pack.accuracy}%</td><td>L${pack.avgLevel}</td></tr>`;
            }).join('');
            const historyLimit = Math.max(5, Math.min(40, Number(settings.statsHistoryLimit) || 5));
            const historyItems = state.sessionHistory.slice(-historyLimit).reverse();
            const historyRows = historyItems.map((item, index) => {
                const replayable = Array.isArray(item.questions) && item.questions.length;
                return `<button type="button" class=\"history-item ${replayable ? 'replayable' : ''}\" data-history-index="${index}" ${replayable ? '' : 'disabled'} title="${replayable ? '重做这一组题' : '旧历史记录未保存题目，无法重做'}"><span class=\"time\">${escapeHtml(new Date(item.at).toLocaleString())} \u00B7 ${escapeHtml(item.source || item.mode || '')}</span><span>${item.total}\u9898</span><span>${item.correct}\u5bf9</span><span>${item.accuracy}%</span></button>`;
            }).join('') || '<div class=\"empty-fav\">\u6682\u65e0\u5386\u53f2\u8bb0\u5f55</div>';
            const historyClass = historyItems.length > 8 ? 'history-list two-col' : 'history-list';
            const streakCard = settings.hideStreaks ? '' : `<div class="stats-mini"><div class="label">当前连胜</div><div class="value">${state.streak}</div></div>`;
            const topicList = topicRows.map(row => {
                const acc = row.answered ? Math.round(row.correct / row.answered * 100) : 0;
                return `<div class="stats-row"><span>${escapeHtml(row.label)}</span><div class="stats-bar"><i style="width:${acc}%"></i></div><b>${acc}%</b></div>`;
            }).join('') || '<p>\u6682\u65e0\u9898\u578b\u6570\u636e</p>';
            const subjectLegend = subjectRecent.map(item => `<span><i class="dot" style="background:${item.color}"></i>${item.label} ${item.value}</span>`).join('');
            const topicLegend = topicPieItems.map(item => `<span><i class=\"dot\" style=\"background:${item.color}\"></i>${escapeHtml(item.label)} ${item.value}</span>`).join('') || '<span>\u6682\u65e0\u8fd1\u65e5\u7ec3\u4e60</span>';

            // Detailed coverage: total, per-subject, per-topic (answer rate + correct rate).
            const subjectCoverageRows = subjectKeys().map(subject => {
                const total = cov.subjectTotals[subject] || 0;
                const answered = cov.subjectAnswered[subject] || 0;
                const correct = cov.subjectCorrect[subject] || 0;
                const rate = total ? Math.round(answered / total * 100) : 0;
                return `<tr><td>${getSubjectName(subject)}</td><td>${total}</td><td>${answered}</td><td>${correct}</td><td>${rate}%</td></tr>`;
            }).join('');
            const topicCoverageRows = Object.keys(cov.topicTotals)
                .sort((a, b) => {
                    const [sa, ta] = a.split('::'), [sb, tb] = b.split('::');
                    return sa === sb ? ta.localeCompare(tb, 'zh') : sa.localeCompare(sb, 'zh');
                })
                .map(key => {
                    const [subject, topic] = key.split('::');
                    const total = cov.topicTotals[key];
                    const answered = cov.topicAnswered[key] || 0;
                    const rate = total ? Math.round(answered / total * 100) : 0;
                    return `<tr><td>${getSubjectName(subject)}</td><td>${escapeHtml(topic)}</td><td>${total}</td><td>${answered}</td><td>${rate}%</td></tr>`;
                }).join('') || '<tr><td colspan=\"5\">\u6682\u65e0\u9898\u578b\u8986\u76d6\u6570\u636e</td></tr>';

            // Per-subject topic pie charts: answer distribution by topic.
            // answers across that subject's topics (from topicStats).
            const subjectTopicPies = subjectKeys().map(subject => {
                const items = Object.entries(state.topicStats || {})
                    .filter(([key]) => key.startsWith(`${subject}::`))
                    .map(([key, stat]) => {
                        const topic = key.split('::')[1];
                        return { label: topic, value: stat.answered || 0, color: topicPalette[(topic.charCodeAt(0) + topic.length) % topicPalette.length] };
                    })
                    .filter(item => item.value > 0)
                    .sort((a, b) => b.value - a.value);
                const legend = items.length ? items.map(item => `<span><i class=\"dot\" style=\"background:${item.color}\"></i>${escapeHtml(item.label)} ${item.value}</span>`).join('') : '<span>\u6682\u65e0\u8be5\u5b66\u79d1\u7ec3\u4e60</span>';
                return `<div class=\"stats-panel\"><h3>${getSubjectName(subject)} \u00B7 \u7ec6\u5206\u9898\u578b\u5206\u5e03</h3><div class=\"pie-wrap\"><div class=\"pie\" style=\"background:${pieStyle(items)}\"></div><div class=\"legend\">${legend}</div></div></div>`;
            }).join('');

            // Aggregate the recent N days of data (configurable, max 30).
            const trendDays = Math.min(30, Math.max(2, settings.statsTrendDays || 14));
            const days = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            for (let i = trendDays - 1; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                days.push(d);
            }
            const dayLabels = days.map(d => `${d.getMonth() + 1}/${d.getDate()}`);
            const chartSubjectKeys = ['calculus', 'linear', 'probability'];
            const accuracyData = { total: [], calculus: [], linear: [], probability: [] };
            const countData = { total: [], calculus: [], linear: [], probability: [] };
            days.forEach(d => {
                const dayStart = d.getTime();
                const dayEnd = dayStart + 86400000;
                const dayItems = state.recentPractice.filter(item => {
                    const t = new Date(item.at).getTime();
                    return t >= dayStart && t < dayEnd;
                });
                const totalAns = dayItems.length;
                const totalCorrect = dayItems.filter(i => i.correct).length;
                accuracyData.total.push(totalAns ? Math.round(totalCorrect / totalAns * 100) : null);
                countData.total.push(totalAns);
                chartSubjectKeys.forEach(subj => {
                    const subjItems = dayItems.filter(i => i.subject === subj);
                    const subjCorrect = subjItems.filter(i => i.correct).length;
                    accuracyData[subj].push(subjItems.length ? Math.round(subjCorrect / subjItems.length * 100) : null);
                    countData[subj].push(subjItems.length);
                });
            });
            const anySubjectStrong = subjectKeys().some(subject => {
                const d = state.allSubjectStats[subject] || {};
                const answered = Number(d.answered || 0);
                const accuracy = answered ? Math.round(Number(d.correct || 0) / answered * 100) : 0;
                return answered >= 50 && accuracy >= 80;
            });
            const activeDaySet = new Set((state.recentPractice || []).map(item => {
                const d = new Date(item.at);
                if (Number.isNaN(d.getTime())) return '';
                return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            }).filter(Boolean));
            (state.sessionHistory || []).forEach(item => {
                const d = new Date(item.at);
                if (!Number.isNaN(d.getTime())) activeDaySet.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
            });
            const dayKey = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            function consecutivePracticeDays() {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                let count = 0;
                for (let i = 0; i < 370; i++) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    if (!activeDaySet.has(dayKey(d))) {
                        if (i === 0) continue;
                        break;
                    }
                    count++;
                }
                return count;
            }
            const activeDays = activeDaySet.size;
            const consecutiveDays = consecutivePracticeDays();
            const mastered100 = Object.values(state.questionAccuracyScores || {}).filter(value => Number(value) >= 100).length;
            const maxQuestionAttempts = Math.max(0, ...Object.values(state.questionAttemptCounts || {}).map(value => Number(value) || 0));
            const bestFocusSeconds = Math.max(Number(state.focusBestSeconds || 0), state.focusMode && state.focusStartTime ? Math.floor((Date.now() - state.focusStartTime) / 1000) : 0);
            const answeredAllDefaultBank = totalQuestions > 0 && cov.answeredKeys.length >= totalQuestions;
            const hasDifficulty10 = !!state.achievementFlags.difficulty10 || (state.recentPractice || []).some(item => Number(item.difficulty || 0) >= 10) || (state.sessionHistory || []).some(item => (item.questions || []).some(q => Number(q.difficulty || 0) >= 10));
            const history = Array.isArray(state.sessionHistory) ? state.sessionHistory : [];
            const bestSessionSize = Math.max(0, ...history.map(item => Number(item.total || 0)), state.answers?.length || 0);
            const hasPerfect10 = history.some(item => Number(item.total || 0) >= 10 && Number(item.correct || 0) === Number(item.total || 0));
            const hasPerfect20 = history.some(item => Number(item.total || 0) >= 20 && Number(item.correct || 0) === Number(item.total || 0));
            const hasNinety20 = history.some(item => Number(item.total || 0) >= 20 && Number(item.accuracy || 0) >= 90);
            const touchedSubjects = new Set((state.recentPractice || []).map(item => item.subject).filter(Boolean));
            history.forEach(item => (item.questions || []).forEach(q => { if (q.subject) touchedSubjects.add(q.subject); }));
            const importedCount = state.customQuestions.length;
            const historyQuestions = history.flatMap(item => Array.isArray(item.questions) ? item.questions : []);
            const hardQuestionKeys = new Set();
            historyQuestions.forEach(q => {
                if (Number(q.difficulty || 0) >= 8) hardQuestionKeys.add(`${q.subject || ''}::${q.id || normalizeStem(q.question || '').slice(0, 64)}`);
            });
            (state.recentPractice || []).forEach(item => {
                if (Number(item.difficulty || 0) >= 8) hardQuestionKeys.add(`${item.subject || ''}::${item.id || item.questionId || item.key || item.question || item.at}`);
            });
            const bestSessionAccuracy = Math.max(0, ...history.map(item => Number(item.accuracy || 0)));
            const strongSubjectCount = subjectKeys().filter(subject => {
                const d = state.allSubjectStats[subject] || {};
                const answered = Number(d.answered || 0);
                const accuracy = answered ? Math.round(Number(d.correct || 0) / answered * 100) : 0;
                return answered >= 100 && accuracy >= 80;
            }).length;
            const answeredTopicCount = Object.values(cov.topicAnswered || {}).filter(value => Number(value || 0) > 0).length;
            const topicMasteryCount = Object.keys(cov.topicTotals || {}).filter(key => {
                const answered = Number(cov.topicAnswered?.[key] || 0);
                const correct = Number(cov.topicCorrect?.[key] || 0);
                return answered >= 10 && answered ? Math.round(correct / answered * 100) >= 80 : false;
            }).length;
            const favoriteSubjectCount = new Set((state.favorites || []).map(item => item.question?.subject).filter(Boolean)).size;
            const achievementDefs = [
                { code: 'N1', title: '\u7b2c\u4e00\u9053\u9898', desc: '\u5b8c\u6210\u7b2c\u4e00\u9053\u9898', value: all.answered, target: 1, colors: ['#1B6B93', '#4FCCA3'] },
                { code: 'N2', title: '\u4e94\u5341\u9898\u8d77\u52bf', desc: '\u7d2f\u8ba1\u5b8c\u6210 50 \u9053\u9898', value: all.answered, target: 50, colors: ['#0EA5E9', '#22C55E'] },
                { code: 'N3', title: '\u767e\u9898\u8282\u594f', desc: '\u7d2f\u8ba1\u5b8c\u6210 100 \u9053\u9898', value: all.answered, target: 100, colors: ['#7C3AED', '#06B6D4'] },
                { code: 'N4', title: '\u4e8c\u767e\u9898\u53f0\u9636', desc: '\u7d2f\u8ba1\u5b8c\u6210 200 \u9053\u9898', value: all.answered, target: 200, colors: ['#2563EB', '#14B8A6'] },
                { code: 'N5', title: '\u4e94\u767e\u9898\u5730\u56fe', desc: '\u7d2f\u8ba1\u5b8c\u6210 500 \u9053\u9898', value: all.answered, target: 500, colors: ['#A855F7', '#0EA5E9'] },
                { code: 'N6', title: '\u5343\u9898\u91cc\u7a0b\u7891', desc: '\u7d2f\u8ba1\u5b8c\u6210 1000 \u9053\u9898', value: all.answered, target: 1000, colors: ['#F59E0B', '#EF4444'] },
                { code: 'N7', title: '\u4e24\u5343\u9898\u5de5\u7a0b', desc: '\u7d2f\u8ba1\u5b8c\u6210 2000 \u9053\u9898', value: all.answered, target: 2000, colors: ['#EC4899', '#7C3AED'] },
                { code: 'N8', title: '\u4e94\u5343\u9898\u8fdc\u822a', desc: '\u7d2f\u8ba1\u5b8c\u6210 5000 \u9053\u9898', value: all.answered, target: 5000, colors: ['#0F766E', '#84CC16'] },
                { code: 'N9', title: '\u4e07\u9898\u8f68\u8ff9', desc: '\u7d2f\u8ba1\u5b8c\u6210 10000 \u9053\u9898', value: all.answered, target: 10000, colors: ['#0F172A', '#F59E0B'] },
                { code: 'P1', title: '\u6b63\u786e\u7387\u5728\u7ebf', desc: '\u81f3\u5c11 20 \u9898\u4e14\u603b\u6b63\u786e\u7387\u8fbe\u5230 80%', value: all.answered >= 20 ? all.accuracy : 0, target: 80, colors: ['#F59E0B', '#EF4444'] },
                { code: 'P3', title: '\u7a33\u5b9a\u9ad8\u5206', desc: '\u81f3\u5c11 50 \u9898\u4e14\u603b\u6b63\u786e\u7387\u8fbe\u5230 90%', value: all.answered >= 50 ? all.accuracy : 0, target: 90, colors: ['#16A34A', '#0EA5E9'] },
                { code: 'P4', title: '\u7cbe\u51c6\u8282\u594f', desc: '\u5355\u6b21\u7ec3\u4e60\u6b63\u786e\u7387\u8fbe\u5230 95%', value: bestSessionAccuracy, target: 95, colors: ['#22C55E', '#A855F7'] },
                ...(settings.hideStreaks ? [] : [{ code: 'P2', title: '\u8fde\u80dc\u624b\u611f', desc: '\u5f53\u524d\u8fde\u80dc\u8fbe\u5230 10', value: state.streak, target: 10, colors: ['#EC4899', '#F97316'] }]),
                { code: 'D10', title: '\u7b2c\u4e00\u6b21\u6311\u6218 L10', desc: '\u5b8c\u6210\u7b2c\u4e00\u9053 10 \u96be\u5ea6\u9898', value: hasDifficulty10 ? 1 : 0, target: 1, colors: ['#DC2626', '#F97316'] },
                { code: 'H8', title: '\u9ad8\u9636\u9898\u5165\u573a', desc: '\u5b8c\u6210 10 \u9053 L8 \u4ee5\u4e0a\u9898\u76ee', value: hardQuestionKeys.size, target: 10, colors: ['#B91C1C', '#F59E0B'] },
                { code: 'H30', title: '\u9ad8\u9636\u9898\u7ec4', desc: '\u5b8c\u6210 30 \u9053 L8 \u4ee5\u4e0a\u9898\u76ee', value: hardQuestionKeys.size, target: 30, colors: ['#7F1D1D', '#F97316'] },
                { code: 'S20', title: '\u957f\u7ec3\u4e60\u5b8c\u6210', desc: '\u5b8c\u6210\u4e00\u6b21\u81f3\u5c11 20 \u9898\u7684\u7ec3\u4e60', value: state.achievementFlags.longSession20 ? 1 : 0, target: 1, colors: ['#0891B2', '#22C55E'] },
                { code: 'S50', title: '\u957f\u5377\u5b8c\u6210', desc: '\u5b8c\u6210\u4e00\u6b21\u81f3\u5c11 50 \u9898\u7684\u7ec3\u4e60', value: bestSessionSize, target: 50, colors: ['#0F766E', '#0EA5E9'] },
                { code: 'Q10', title: '\u5341\u9898\u5168\u5bf9', desc: '\u5b8c\u6210\u4e00\u6b21 10 \u9898\u4ee5\u4e0a\u7684\u5168\u5bf9\u7ec3\u4e60', value: hasPerfect10 ? 1 : 0, target: 1, colors: ['#22C55E', '#14B8A6'] },
                { code: 'Q20', title: '\u4e8c\u5341\u9898\u5168\u5bf9', desc: '\u5b8c\u6210\u4e00\u6b21 20 \u9898\u4ee5\u4e0a\u7684\u5168\u5bf9\u7ec3\u4e60', value: hasPerfect20 ? 1 : 0, target: 1, colors: ['#84CC16', '#F59E0B'] },
                { code: 'Q90', title: '\u9ad8\u51c6\u5ea6\u957f\u7ec3', desc: '\u4e00\u6b21 20 \u9898\u4ee5\u4e0a\u7ec3\u4e60\u6b63\u786e\u7387\u8fbe\u5230 90%', value: hasNinety20 ? 1 : 0, target: 1, colors: ['#2563EB', '#22C55E'] },
                { code: 'T1', title: '\u8ba1\u65f6\u5f00\u59cb', desc: '\u5b8c\u6210\u4e00\u6b21\u8ba1\u65f6\u6a21\u5f0f\u7ec3\u4e60', value: state.achievementFlags.timerSession ? 1 : 0, target: 1, colors: ['#7C3AED', '#F59E0B'] },
                { code: 'F10', title: '\u5341\u5206\u949f\u4e13\u6ce8', desc: '\u5728\u4e13\u6ce8\u6a21\u5f0f\u4e0b\u575a\u6301 10 \u5206\u949f', value: Math.floor(bestFocusSeconds / 60), target: 10, colors: ['#1D4ED8', '#06B6D4'] },
                { code: 'C7', title: '\u4e03\u65e5\u8fde\u7eed', desc: '\u8fde\u7eed\u7ec3\u4e60 7 \u5929', value: consecutiveDays, target: 7, colors: ['#10B981', '#84CC16'] },
                { code: 'C15', title: '\u5341\u4e94\u65e5\u8f68\u9053', desc: '\u8fde\u7eed\u7ec3\u4e60 15 \u5929', value: consecutiveDays, target: 15, colors: ['#0EA5E9', '#6366F1'] },
                { code: 'C30', title: '\u4e09\u5341\u65e5\u4e60\u60ef', desc: '\u8fde\u7eed\u7ec3\u4e60 30 \u5929', value: consecutiveDays, target: 30, colors: ['#9333EA', '#EC4899'] },
                { code: 'I1', title: '\u7b2c\u4e00\u9053\u81ea\u5efa\u9898', desc: '\u5bfc\u5165\u6216\u6dfb\u52a0\u4f60\u7684\u7b2c\u4e00\u9053\u9898', value: state.achievementFlags.firstImport || state.customQuestions.length ? 1 : 0, target: 1, colors: ['#14B8A6', '#4FCCA3'] },
                { code: 'I10', title: '\u81ea\u5efa\u5c0f\u9898\u7ec4', desc: '\u5bfc\u5165\u6216\u6dfb\u52a0 10 \u9053\u81ea\u5efa\u9898', value: importedCount, target: 10, colors: ['#0EA5E9', '#A855F7'] },
                { code: 'I50', title: '\u4e2a\u4eba\u9898\u5e93\u96cf\u5f62', desc: '\u5bfc\u5165\u6216\u6dfb\u52a0 50 \u9053\u81ea\u5efa\u9898', value: importedCount, target: 50, colors: ['#DB2777', '#F97316'] },
                { code: 'R10', title: '\u53cd\u590d\u6253\u78e8', desc: '\u540c\u4e00\u9053\u9898\u7d2f\u8ba1\u56de\u7b54 10 \u6b21', value: maxQuestionAttempts, target: 10, colors: ['#F97316', '#EF4444'] },
                { code: 'M10', title: '\u5341\u9898\u6ee1\u638c\u63e1', desc: '\u81f3\u5c11 10 \u9053\u9898\u8fbe\u5230 100% \u638c\u63e1', value: mastered100, target: 10, colors: ['#22C55E', '#0EA5E9'] },
                { code: 'M25', title: '\u4e8c\u5341\u4e94\u4e2a\u786e\u5b9a\u70b9', desc: '\u81f3\u5c11 25 \u9053\u9898\u8fbe\u5230 100% \u638c\u63e1', value: mastered100, target: 25, colors: ['#16A34A', '#84CC16'] },
                { code: 'M50', title: '\u4e94\u5341\u9898\u638c\u63e1\u9762', desc: '\u81f3\u5c11 50 \u9053\u9898\u8fbe\u5230 100% \u638c\u63e1', value: mastered100, target: 50, colors: ['#059669', '#2563EB'] },
                { code: 'M100', title: '\u767e\u9898\u638c\u63e1', desc: '\u81f3\u5c11 100 \u9053\u9898\u8fbe\u5230 100% \u638c\u63e1', value: mastered100, target: 100, colors: ['#047857', '#0EA5E9'] },
                { code: 'B1', title: '\u6536\u85cf\u7b2c\u4e00\u9898', desc: '\u6536\u85cf 1 \u9053\u9898', value: state.favorites.length, target: 1, colors: ['#F59E0B', '#EC4899'] },
                { code: 'B20', title: '\u6536\u85cf\u5939\u6210\u5f62', desc: '\u6536\u85cf 20 \u9053\u9898', value: state.favorites.length, target: 20, colors: ['#A855F7', '#F97316'] },
                { code: 'B100', title: '\u4e2a\u4eba\u9898\u518c', desc: '\u6536\u85cf 100 \u9053\u9898', value: state.favorites.length, target: 100, colors: ['#DB2777', '#7C3AED'] },
                { code: 'B3', title: '\u4e09\u79d1\u6536\u85cf', desc: '\u4e09\u95e8\u79d1\u76ee\u90fd\u6709\u6536\u85cf\u9898', value: favoriteSubjectCount, target: 3, colors: ['#F59E0B', '#14B8A6'] },
                { code: 'K1', title: '\u5355\u79d1\u7a81\u7834', desc: '\u4efb\u4e00\u79d1 50 \u9898\u4ee5\u4e0a\u4e14\u6b63\u786e\u7387 80%', value: anySubjectStrong ? 1 : 0, target: 1, colors: ['#14B8A6', '#84CC16'] },
                { code: 'K3', title: '\u4e09\u79d1\u90fd\u5f00\u5c40', desc: '\u4e09\u95e8\u79d1\u76ee\u90fd\u81f3\u5c11\u5b8c\u6210\u8fc7 1 \u9053\u9898', value: touchedSubjects.size, target: 3, colors: ['#1B6B93', '#A18CD1'] },
                { code: 'K6', title: '\u4e09\u79d1\u7a33\u5b9a', desc: '\u4e09\u95e8\u79d1\u76ee\u90fd 100 \u9898\u4ee5\u4e0a\u4e14\u6b63\u786e\u7387 80%', value: strongSubjectCount, target: 3, colors: ['#1D4ED8', '#22C55E'] },
                { code: 'K5', title: '\u9898\u5e93\u63a2\u7d22', desc: '\u5df2\u7b54\u9898\u8986\u76d6\u9898\u5e93 5%', value: totalRate, target: 5, colors: ['#2563EB', '#A855F7'] },
                { code: 'K12', title: '\u9898\u578b\u5730\u56fe', desc: '\u5df2\u63a2\u7d22 12 \u4e2a\u7ec6\u5206\u9898\u578b', value: answeredTopicCount, target: 12, colors: ['#0EA5E9', '#F59E0B'] },
                { code: 'K18', title: '\u9898\u578b\u9aa8\u67b6', desc: '18 \u4e2a\u7ec6\u5206\u9898\u578b\u81f3\u5c11\u7b54\u8fc7 1 \u9898', value: answeredTopicCount, target: 18, colors: ['#6366F1', '#14B8A6'] },
                { code: 'T80', title: '\u9898\u578b\u7a33\u638c\u63e1', desc: '5 \u4e2a\u7ec6\u5206\u9898\u578b\u8fbe\u5230 10 \u9898\u4e14 80% \u6b63\u786e\u7387', value: topicMasteryCount, target: 5, colors: ['#059669', '#84CC16'] },
                { code: 'K100', title: '\u9ed8\u8ba4\u9898\u5e93\u5168\u8986\u76d6', desc: '\u5b8c\u6210\u9ed8\u8ba4\u9898\u5e93\u5168\u90e8\u9898\u76ee', value: answeredAllDefaultBank ? 1 : 0, target: 1, colors: ['#0F172A', '#1B6B93'] },
                { code: 'A3', title: '\u4e09\u5929\u51fa\u73b0', desc: '\u4e0d\u540c\u65e5\u671f\u6709 3 \u5929\u7ec3\u4e60\u8bb0\u5f55', value: activeDays, target: 3, colors: ['#10B981', '#F59E0B'] }
            ];
            const achievementCards = achievementDefs.map(item => {
                const unlocked = Number(item.value || 0) >= Number(item.target || 1);
                const progress = Math.max(0, Math.min(100, Math.round(Number(item.value || 0) / Math.max(1, Number(item.target || 1)) * 100)));
                const status = unlocked ? '\u5df2\u8fbe\u6210' : `${Math.min(Number(item.value || 0), Number(item.target || 1))}/${item.target}`;
                return `<div class="achievement-card ${unlocked ? 'unlocked' : ''}" style="--ach-a:${item.colors[0]};--ach-b:${item.colors[1]};--progress:${progress}%;">
                    <div class="achievement-top"><span class="achievement-badge">${escapeHtml(item.code)}</span><span class="achievement-desc">${status}</span></div>
                    <div><div class="achievement-title">${escapeHtml(item.title)}</div><div class="achievement-desc">${escapeHtml(item.desc)}</div></div>
                    <div class="achievement-progress"><i></i></div>
                </div>`;
            }).join('');

            const analysis = buildLearningAnalysis();
            content.innerHTML = `
                <div class="stats-layout">
                    <div class="stats-sidebar" id="statsSidebar">
                        <button class="stats-sidebar-item active" data-stats-tab="overview"><i class="fm-icon s-overview"></i>练习统计</button>
                        <button class="stats-sidebar-item" data-stats-tab="history"><i class="fm-icon s-history"></i>历史记录</button>
                        <button class="stats-sidebar-item" data-stats-tab="trends"><i class="fm-icon s-trends"></i>趋势</button>
                        <button class="stats-sidebar-item" data-stats-tab="accuracy"><i class="fm-icon s-accuracy"></i>正确率</button>
                        <button class="stats-sidebar-item" data-stats-tab="coverage"><i class="fm-icon s-coverage"></i>题库覆盖</button>
                        <button class="stats-sidebar-item" data-stats-tab="pie"><i class="fm-icon s-pie"></i>饼图</button>
                        <button class="stats-sidebar-item" data-stats-tab="network"><i class="fm-icon s-network"></i>知识网络</button>
                        <button class="stats-sidebar-item" data-stats-tab="achievements"><i class="fm-icon s-achievements"></i>成就</button>
                    </div>
                    <div class="stats-main">
                        <div class="stats-section-content active" data-stats-section="overview">
                            <div class="stats-grid">
                                <div class="stats-mini"><div class="label">所有模式总题数</div><div class="value">${all.answered}</div></div>
                                <div class="stats-mini"><div class="label">所有模式正确数</div><div class="value">${all.correct}</div></div>
                                <div class="stats-mini"><div class="label">所有模式正确率</div><div class="value">${all.accuracy}%</div></div>
                                ${streakCard}
                                <div class="stats-mini"><div class="label">默认模式总题数</div><div class="value">${def.answered}</div></div>
                                <div class="stats-mini"><div class="label">默认模式正确数</div><div class="value">${def.correct}</div></div>
                                <div class="stats-mini"><div class="label">默认模式正确率</div><div class="value">${def.accuracy}%</div></div>
                                <div class="stats-mini"><div class="label">平均难度</div><div class="value">L${all.avgLevel}</div></div>
                            </div>
                        </div>
                        <div class="stats-section-content" data-stats-section="history">
                            <div class="stats-panels">
                                <div class="stats-panel history-panel" style="grid-column:1/-1;"><h3>近 ${historyLimit} 次历史记录</h3><div class="${historyClass}">${historyRows}</div></div>
                            </div>
                        </div>
                        <div class="stats-section-content" data-stats-section="trends">
                            <div class="stats-panels">
                                <div class="stats-panel" style="grid-column:1/-1;">
                                    <h3>近 ${trendDays} 天正确率趋势</h3>
                                    ${renderLineChart('正确率', dayLabels, [
                                        { name: '总体', color: '#475569', data: accuracyData.total },
                                        { name: '高等数学', color: '#1B6B93', data: accuracyData.calculus },
                                        { name: '线性代数', color: '#A18CD1', data: accuracyData.linear },
                                        { name: '概率统计', color: '#4FCCA3', data: accuracyData.probability }
                                    ], '正确率', 100)}
                                </div>
                                <div class="stats-panel" style="grid-column:1/-1;">
                                    <h3>近 ${trendDays} 天答题量趋势</h3>
                                    ${renderLineChart('答题量', dayLabels, [
                                        { name: '总体', color: '#475569', data: countData.total },
                                        { name: '高等数学', color: '#1B6B93', data: countData.calculus },
                                        { name: '线性代数', color: '#A18CD1', data: countData.linear },
                                        { name: '概率统计', color: '#4FCCA3', data: countData.probability }
                                    ], '答题量', null)}
                                </div>
                            </div>
                        </div>
                        <div class="stats-section-content" data-stats-section="accuracy">
                            <div class="stats-panels">
                                <div class="stats-panel"><h3>所有模式分科目</h3><table class="stats-table"><thead><tr><th>科目</th><th>题数</th><th>正确</th><th>正确率</th><th>平均难度</th></tr></thead><tbody>${subjectRows}</tbody></table></div>
                                <div class="stats-panel"><h3>默认模式分科目</h3><table class="stats-table"><thead><tr><th>科目</th><th>题数</th><th>正确</th><th>正确率</th><th>平均难度</th></tr></thead><tbody>${defaultSubjectRows}</tbody></table></div>
                                <div class="stats-panel"><h3>细分题型正确率</h3><div class="stats-list">${topicList}</div></div>
                            </div>
                        </div>
                        <div class="stats-section-content" data-stats-section="coverage">
                            <div class="stats-panels">
                                <div class="stats-panel stats-coverage" style="grid-column:1/-1;"><h3>题库覆盖</h3>
                                    <div class="coverage-section"><h4>总览</h4>
                                        <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);">
                                            <div class="stats-mini"><div class="label">题库总题数</div><div class="value">${totalQuestions}</div></div>
                                            <div class="stats-mini"><div class="label">总回答量（去重）</div><div class="value">${cov.answeredKeys.length}</div></div>
                                            <div class="stats-mini"><div class="label">总回答率</div><div class="value">${totalRate}%</div></div>
                                            <div class="stats-mini"><div class="label">已答对覆盖率</div><div class="value">${totalCorrectRate}%</div></div>
                                        </div>
                                    </div>
                                    <div class="coverage-section"><h4>分学科覆盖</h4>
                                        <table class="stats-table"><thead><tr><th>学科</th><th>题库题量</th><th>回答数</th><th>答对数</th><th>回答率</th></tr></thead><tbody>${subjectCoverageRows}</tbody></table>
                                    </div>
                                    <div class="coverage-section"><h4>分学科 · 细分题型覆盖</h4>
                                        <table class="stats-table"><thead><tr><th>学科</th><th>题型</th><th>题库题量</th><th>回答数</th><th>回答率</th></tr></thead><tbody>${topicCoverageRows}</tbody></table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="stats-section-content" data-stats-section="pie">
                            <div class="stats-panels">
                                <div class="stats-panel"><h3>近日练习科目比例</h3><div class="pie-wrap"><div class="pie" style="background:${pieStyle(subjectRecent)}"></div><div class="legend">${subjectLegend}</div></div></div>
                                <div class="stats-panel"><h3>近日细分题型比例</h3><div class="pie-wrap"><div class="pie" style="background:${pieStyle(topicPieItems)}"></div><div class="legend">${topicLegend}</div></div></div>
                                ${subjectTopicPies}
                            </div>
                        </div>
                        <div class="stats-section-content" data-stats-section="network">
                            <div class="stats-panels">
                                <div class="stats-panel" style="grid-column:1/-1;">
                                    <h3>知识双链网络</h3>
                                    <div class="knowledge-network" id="knowledgeNetwork">正在加载知识关联...</div>
                                    <div class="network-actions">
                                        <select id="networkExportFormat"></select>
                                        <button class="preview-enter" id="exportNetworkBtn">导出网络</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="stats-section-content" data-stats-section="achievements">
                            <div class="stats-panels">
                                <div class="stats-panel" style="grid-column:1/-1;">
                                    <h3>成就系统</h3>
                                    <div class="achievement-grid">${achievementCards}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            mountStatsAnalysis(content, analysis);
            $$('#statsSidebar .stats-sidebar-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    $$('#statsSidebar .stats-sidebar-item').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const tab = btn.dataset.statsTab;
                    $$('.stats-section-content').forEach(s => s.classList.toggle('active', s.dataset.statsSection === tab));
                });
            });
            fillSelectOptions($('networkExportFormat'), graphExportFormats, settings.graphExportFormat || 'svg');
            $('exportNetworkBtn')?.addEventListener('click', exportKnowledgeNetwork);
            $$('.history-item.replayable').forEach(btn => btn.addEventListener('click', () => {
                const item = historyItems[Number(btn.dataset.historyIndex)];
                replayHistorySession(item);
            }));
            renderKnowledgeNetwork();
        }

        async function renderKnowledgeNetwork() {
            const container = $('knowledgeNetwork');
            if (!container) return;
            let graph;
            try {
                const answered = Object.keys(state.answeredQuestionKeys || {});
                const params = answered.length ? `?all=1&attempts=${encodeURIComponent(JSON.stringify(Object.fromEntries(answered.map(k => [k, true]))))}` : '?all=1';
                const res = await fetch(apiUrl(`/api/graph${params}`));
                graph = await res.json();
                if (!graph.ok) throw new Error(graph.error || 'graph failed');
            } catch (_) {
                graph = localKnowledgeGraph();
            }
            renderKnowledgeNetworkSvg(container, graph);
        }

        function buildLearningAnalysis() {
            const now = Date.now();
            const recent = Array.isArray(state.recentPractice) ? state.recentPractice : [];
            const bySubject = new Map();
            const byTopic = new Map();
            recent.forEach(item => {
                const subject = item.subject || 'calculus';
                const topic = sanitizeMathTopic(item.topic || '\u672a\u5206\u7c7b', subject, item.type);
                const atTime = new Date(item.at || now).getTime();
                const subjectRow = bySubject.get(subject) || { subject, answered: 0, correct: 0, lastAt: 0 };
                subjectRow.answered++;
                if (item.correct) subjectRow.correct++;
                subjectRow.lastAt = Math.max(subjectRow.lastAt, atTime || 0);
                bySubject.set(subject, subjectRow);
                const key = `${subject}::${topic}`;
                const topicRow = byTopic.get(key) || { key, subject, topic, answered: 0, correct: 0, lastAt: 0 };
                topicRow.answered++;
                if (item.correct) topicRow.correct++;
                topicRow.lastAt = Math.max(topicRow.lastAt, atTime || 0);
                byTopic.set(key, topicRow);
            });
            subjectKeys().forEach(subject => {
                if (!bySubject.has(subject)) bySubject.set(subject, { subject, answered: 0, correct: 0, lastAt: 0 });
                getAllQuestions(subject).slice(0, 600).forEach(q => {
                    const topic = sanitizeMathTopic(classifyQuestion({ ...q, subject }).topic, subject, q.type);
                    const key = `${subject}::${topic}`;
                    if (!byTopic.has(key)) byTopic.set(key, { key, subject, topic, answered: 0, correct: 0, lastAt: 0 });
                });
            });
            const subjectRows = [...bySubject.values()].map(row => ({
                ...row,
                accuracy: row.answered ? Math.round(row.correct / row.answered * 100) : 0,
                lastDays: row.lastAt ? Math.floor((now - row.lastAt) / 86400000) : null
            })).sort((a, b) => a.accuracy - b.accuracy || a.answered - b.answered);
            const topicRows = [...byTopic.values()].map(row => ({
                ...row,
                accuracy: row.answered ? Math.round(row.correct / row.answered * 100) : 0,
                lastDays: row.lastAt ? Math.floor((now - row.lastAt) / 86400000) : null
            }));
            const weakTopics = topicRows.filter(row => row.answered > 0 && row.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy || b.answered - a.answered).slice(0, 8);
            const staleTopics = topicRows.filter(row => row.answered > 0 && row.lastDays !== null && row.lastDays >= 10).sort((a, b) => b.lastDays - a.lastDays || a.accuracy - b.accuracy).slice(0, 8);
            const untouchedImportant = topicRows.filter(row => row.answered === 0).slice(0, 8);
            const targetTopics = [...weakTopics, ...staleTopics, ...untouchedImportant].slice(0, 10);
            const seenQuestion = new Set();
            const recommendations = [];
            targetTopics.forEach(topic => {
                getAllQuestions(topic.subject).forEach(q => {
                    if (recommendations.length >= 12) return;
                    const key = questionKey({ ...q, subject: topic.subject });
                    if (seenQuestion.has(key) || Number(state.questionAttemptCounts?.[key] || 0) > 0) return;
                    const info = classifyQuestion({ ...q, subject: topic.subject });
                    if (sanitizeMathTopic(info.topic, topic.subject, q.type) !== topic.topic) return;
                    seenQuestion.add(key);
                    recommendations.push({ q: { ...q, subject: topic.subject }, key, subject: topic.subject, topic: topic.topic });
                });
            });
            const fallbackText = [
                weakTopics.length ? `\u8584\u5f31\u70b9\u4f18\u5148\u590d\u4e60\uff1a${weakTopics.slice(0, 3).map(t => `${getSubjectName(t.subject)}-${t.topic}`).join('\u3001')}\u3002` : '\u6682\u672a\u53d1\u73b0\u660e\u663e\u8584\u5f31\u9898\u578b\u3002',
                staleTopics.length ? `\u8f83\u4e45\u672a\u7ec3\uff1a${staleTopics.slice(0, 3).map(t => `${t.topic}${t.lastDays}\u5929`).join('\u3001')}\u3002` : '\u8fd1\u671f\u9898\u578b\u590d\u4e60\u95f4\u9694\u8f83\u5747\u8861\u3002',
                recommendations.length ? '\u5df2\u4ece\u9898\u5e93\u6311\u51fa\u76f8\u8fd1\u7684\u8584\u5f31\u70b9\u9898\u76ee\uff0c\u53ef\u76f4\u63a5\u70b9\u51fb\u8fdb\u5165\u3002' : '\u5efa\u8bae\u5148\u5b8c\u6210\u66f4\u591a\u9898\u76ee\uff0c\u7cfb\u7edf\u624d\u80fd\u66f4\u7a33\u5b9a\u5730\u63a8\u8350\u76f8\u4f3c\u9898\u3002'
            ].join('');
            return { subjectRows, weakTopics, staleTopics, untouchedImportant, recommendations, fallbackText };
        }

        function mountStatsAnalysis(content, analysis) {
            const sidebar = content.querySelector('#statsSidebar');
            const main = content.querySelector('.stats-main');
            if (!sidebar || !main || !analysis) return;
            const labels = { overview: '\u7ec3\u4e60\u7edf\u8ba1', history: '\u5386\u53f2\u8bb0\u5f55', trends: '\u8d8b\u52bf', accuracy: '\u6b63\u786e\u7387', coverage: '\u9898\u5e93\u8986\u76d6', pie: '\u6bd4\u4f8b\u56fe', network: '\u77e5\u8bc6\u7f51\u7edc', achievements: '\u6210\u5c31' };
            Object.entries(labels).forEach(([tab, label]) => {
                const btn = sidebar.querySelector(`[data-stats-tab="${tab}"]`);
                const icon = btn?.querySelector('.fm-icon')?.outerHTML || '';
                if (btn) btn.innerHTML = `${icon}${label}`;
            });
            if (!sidebar.querySelector('[data-stats-tab="analysis"]')) {
                const btn = document.createElement('button');
                btn.className = 'stats-sidebar-item';
                btn.dataset.statsTab = 'analysis';
                btn.innerHTML = '<i class="fm-icon s-accuracy"></i>\u7efc\u5408\u5206\u6790';
                sidebar.insertBefore(btn, sidebar.querySelector('[data-stats-tab="achievements"]') || null);
            }
            if (!main.querySelector('[data-stats-section="analysis"]')) main.insertAdjacentHTML('beforeend', renderStatsAnalysisHtml(analysis));
            renderLatex(main.querySelector('[data-stats-section="analysis"]') || main);
            $$('.analysis-question-btn').forEach(btn => btn.addEventListener('click', () => {
                const item = analysis.recommendations[Number(btn.dataset.analysisIndex)];
                if (item?.q) startQuiz([item.q], 'analysis', 'stats-analysis');
            }));
            enhanceLearningAnalysisWithAi(analysis);
        }

        function renderStatsAnalysisHtml(analysis) {
            const subjectRows = analysis.subjectRows.map(row => `<div class="stats-row"><b>${escapeHtml(getSubjectName(row.subject))}</b><span>${row.answered}\u9898 / ${row.accuracy}%</span></div>`).join('');
            const weakRows = analysis.weakTopics.map(row => `<div class="stats-row"><b>${escapeHtml(getSubjectName(row.subject))} · ${escapeHtml(row.topic)}</b><span>${row.answered}\u9898 / ${row.accuracy}%</span></div>`).join('') || '<div class="stats-empty">\u6682\u65e0\u660e\u663e\u8584\u5f31\u70b9</div>';
            const staleRows = analysis.staleTopics.map(row => `<div class="stats-row"><b>${escapeHtml(getSubjectName(row.subject))} · ${escapeHtml(row.topic)}</b><span>${row.lastDays}\u5929\u672a\u7ec3</span></div>`).join('') || '<div class="stats-empty">\u6682\u65e0\u957f\u65f6\u95f4\u672a\u590d\u4e60\u9898\u578b</div>';
            const recRows = analysis.recommendations.map((item, index) => `<button class="analysis-question-btn" data-analysis-index="${index}"><b>${escapeHtml(getSubjectName(item.subject))} · ${escapeHtml(item.topic)}</b><span>${questionHtml(item.q, 72)}</span></button>`).join('') || '<div class="stats-empty">\u6682\u65e0\u53ef\u63a8\u8350\u9898\u76ee</div>';
            return `<div class="stats-section-content" data-stats-section="analysis"><div class="stats-panels">
                <div class="stats-panel" style="grid-column:1/-1;"><h3>\u7efc\u5408\u5206\u6790</h3><div class="stats-analysis-summary" id="aiAnalysisText">${escapeHtml(analysis.fallbackText)}</div></div>
                <div class="stats-panel"><h3>\u5b66\u79d1\u638c\u63e1</h3><div class="stats-list">${subjectRows}</div></div>
                <div class="stats-panel"><h3>\u8584\u5f31\u7ec6\u5206\u9898\u578b</h3><div class="stats-list">${weakRows}</div></div>
                <div class="stats-panel"><h3>\u9700\u590d\u4e60\u9898\u578b</h3><div class="stats-list">${staleRows}</div></div>
                <div class="stats-panel" style="grid-column:1/-1;"><h3>\u76f8\u4f3c\u8584\u5f31\u70b9\u9898\u76ee</h3><div class="analysis-question-list">${recRows}</div></div>
            </div></div>`;
        }

        async function enhanceLearningAnalysisWithAi(analysis) {
            const el = $('aiAnalysisText');
            if (!el || !settings.useLocalModel) return;
            const payload = {
                subjects: analysis.subjectRows.slice(0, 6),
                weakTopics: analysis.weakTopics.slice(0, 8),
                staleTopics: analysis.staleTopics.slice(0, 8),
                recommendations: analysis.recommendations.slice(0, 6).map(item => ({ subject: getSubjectName(item.subject), topic: item.topic, question: item.q.question }))
            };
            const prompt = `\u6839\u636e\u4ee5\u4e0b\u6d4f\u89c8\u5668\u672c\u5730\u5b66\u4e60\u6570\u636e\uff0c\u8f93\u51fa JSON {"summary":"..."}\uff0c\u7528 3-5 \u53e5\u8bdd\u5206\u6790\u5404\u5b66\u79d1\u548c\u7ec6\u5206\u9898\u578b\u638c\u63e1\u60c5\u51b5\uff0c\u63d0\u9192\u9700\u590d\u4e60\u7684\u505a\u8fc7\u9898\u578b\uff0c\u5e76\u8bf4\u660e\u63a8\u8350\u76f8\u4f3c\u8584\u5f31\u70b9\u9898\u76ee\u7684\u539f\u56e0\u3002\n${JSON.stringify(payload)}`;
            const parsed = await callConfiguredLocalJson(prompt);
            if (parsed?.summary) el.textContent = String(parsed.summary).slice(0, 700);
        }

        function localKnowledgeGraph() {
            const answeredKeys = new Set(Object.keys(state.answeredQuestionKeys || {}));
            const allQuestions = subjectKeys().flatMap(subject => getAllQuestions(subject).map(q => ({ ...q, subject })));
            const questions = (answeredKeys.size ? allQuestions.filter(q => answeredKeys.has(questionKey(q))) : allQuestions).slice(0, 260);
            const nodes = [];
            const links = [];
            const nodeMap = new Map();
            const linkSet = new Set();
            const addNode = node => {
                if (nodeMap.has(node.id)) return nodeMap.get(node.id);
                nodeMap.set(node.id, node);
                nodes.push(node);
                return node;
            };
            const addLink = (source, target, relation) => {
                if (!source || !target || source === target) return;
                const key = `${source}->${target}`;
                if (linkSet.has(key)) return;
                linkSet.add(key);
                links.push({ source, target, relation });
            };
            subjectKeys().map(subject => [subject, getSubjectName(subject)]).forEach(([subject, name]) => {
                if (!questions.some(q => q.subject === subject)) return;
                const subjectId = `${subject}::subject`;
                addNode({ id: subjectId, label: name, group: subject, kind: 'subject', questionCount: 0, questions: [] });
                (topicRules[subject] || []).forEach(([topic]) => {
                    const topicId = `${subject}::topic::${topic}`;
                    addNode({ id: topicId, label: topic, group: subject, kind: 'topic', questionCount: 0, questions: [] });
                    addLink(subjectId, topicId, '科目');
                });
            });
            questions.forEach(q => {
                const info = classifyQuestion(q);
                const subjectId = `${q.subject}::subject`;
                const topicId = `${q.subject}::topic::${info.topic}`;
                const topicNode = addNode({ id: topicId, label: info.topic, group: q.subject, kind: 'topic', questionCount: 0, questions: [] });
                topicNode.questionCount++;
                if (topicNode.questions.length < 24) topicNode.questions.push({ id: q.id, question: q.question, type: q.type, difficulty: q.difficulty });
                const subjectNode = nodeMap.get(subjectId);
                if (subjectNode) subjectNode.questionCount++;
                addLink(subjectId, topicId, '知识点');
                const words = sanitizeMathKeywords(info.keywords, q.subject, `${q.question} ${(q.options || []).join(' ')} ${q.explanation || ''}`, 4, info.topic);
                words.forEach(word => {
                    const keywordId = `${q.subject}::keyword::${word}`;
                    const keywordNode = addNode({ id: keywordId, label: word, group: q.subject, kind: 'keyword', questionCount: 0, questions: [] });
                    keywordNode.questionCount++;
                    if (keywordNode.questions.length < 20) keywordNode.questions.push({ id: q.id, question: q.question, type: q.type, difficulty: q.difficulty });
                    addLink(topicId, keywordId, '关键词');
                });
                for (let i = 0; i < words.length - 1; i++) addLink(`${q.subject}::keyword::${words[i]}`, `${q.subject}::keyword::${words[i + 1]}`, '共现');
            });
            const usedIds = new Set(links.flatMap(link => [link.source, link.target]));
            return { ok: true, nodes: nodes.filter(node => usedIds.has(node.id) || node.kind === 'subject'), links };
        }

        function renderKnowledgeNetworkSvg(container, data) {
            latestKnowledgeGraph = data;
            const allNodes = data.nodes || [];
            const rawLinks = data.links || [];
            const nodeByRawId = new Map(allNodes.map(node => [node.id, node]));
            const degree = new Map();
            rawLinks.forEach(link => {
                degree.set(link.source, (degree.get(link.source) || 0) + 1);
                degree.set(link.target, (degree.get(link.target) || 0) + 1);
            });
            const nodePick = new Map();
            const addPicked = id => {
                const node = nodeByRawId.get(id);
                if (node && !nodePick.has(id)) nodePick.set(id, node);
            };
            allNodes
                .filter(node => node.kind === 'subject' || node.kind === 'topic')
                .forEach(node => addPicked(node.id));
            allNodes
                .filter(node => !nodePick.has(node.id))
                .sort((a, b) => (degree.get(b.id) || 0) - (degree.get(a.id) || 0))
                .slice(0, 180)
                .forEach(node => addPicked(node.id));
            rawLinks
                .filter(link => nodePick.has(link.source) || nodePick.has(link.target))
                .sort((a, b) => ((degree.get(b.source) || 0) + (degree.get(b.target) || 0)) - ((degree.get(a.source) || 0) + (degree.get(a.target) || 0)))
                .forEach(link => {
                    if (nodePick.size >= 260) return;
                    addPicked(link.source);
                    addPicked(link.target);
                });
            const pickedIds = new Set(nodePick.keys());
            const links = rawLinks.filter(link => pickedIds.has(link.source) && pickedIds.has(link.target)).slice(0, 900);
            const linkedIds = new Set(links.flatMap(link => [link.source, link.target]));
            const nodes = [...nodePick.values()].filter(node => linkedIds.has(node.id) || node.kind === 'subject');
            if (!nodes.length) {
                container.textContent = '暂无知识网络数据。';
                return;
            }
            const W = 1880, H = 1040, cx = W / 2, cy = H / 2;
            const pos = new Map();
            const labelSize = node => {
                const text = String(node.label || '');
                const font = node.kind === 'topic' ? 14 : 12;
                return { w: Math.min(168, Math.max(38, text.length * font * 0.68 + 12)), h: font + 12, font };
            };
            const nodeBounds = (r, label) => ({ w: r * 2 + 8 + label.w, h: Math.max(r * 2, label.h) });
            const rectsOverlap = (a, b, gap = 8) => {
                return !(a.x + a.w / 2 + gap < b.x - b.w / 2 || a.x - a.w / 2 - gap > b.x + b.w / 2 || a.y + a.h / 2 + gap < b.y - b.h / 2 || a.y - a.h / 2 - gap > b.y + b.h / 2);
            };
            const clampNode = item => item;
            const topics = nodes.filter(n => n.kind === 'topic' || n.kind === 'subject');
            const keywords = nodes.filter(n => n.kind !== 'topic' && n.kind !== 'subject');
            keywords.sort((a, b) => String(b.label || '').length - String(a.label || '').length);
            const ordered = [...topics, ...keywords];
            const topicAnchors = new Map();
            ordered.forEach((node, i) => {
                const r = node.kind === 'subject' ? 18 : (node.kind === 'topic' ? 14 : 9);
                const label = labelSize(node);
                const bounds = nodeBounds(r, label);
                let orbit, a;
                if (node.kind === 'subject') {
                    const subjectIndex = topics.filter(n => n.kind === 'subject').indexOf(node);
                    orbit = 90;
                    a = (subjectIndex / Math.max(1, subjectKeys().length)) * Math.PI * 2 - Math.PI / 2;
                } else if (node.kind === 'topic') {
                    const topicIndex = topics.indexOf(node);
                    const ring = topicIndex % 2;
                    orbit = 250 + ring * 135;
                    a = (topicIndex / Math.max(1, topics.length)) * Math.PI * 2 + ring * 0.4;
                } else {
                    const keywordIndex = keywords.indexOf(node);
                    const owner = links.find(link => link.target === node.id && String(link.source).includes('::topic::'));
                    const anchor = owner ? topicAnchors.get(owner.source) : null;
                    const perRing = 18;
                    const ring = Math.floor(keywordIndex / perRing);
                    const idxInRing = keywordIndex % perRing;
                    const textLen = String(node.label || '').length;
                    if (anchor) {
                        orbit = 135 + (idxInRing % 3) * 50 + Math.min(textLen * 2, 32);
                        a = anchor.a + ((idxInRing % 7) - 3) * 0.28 + ring * 0.18;
                    } else {
                        orbit = 430 + ring * 160 + Math.min(textLen * 2, 40);
                        a = (idxInRing / perRing) * Math.PI * 2 + ring * 0.32;
                    }
                }
                const item = { x: cx + Math.cos(a) * orbit, y: cy + Math.sin(a) * orbit, r, label, bounds, node };
                if (node.kind === 'topic') topicAnchors.set(node.id, { a, orbit });
                clampNode(item);
                for (let attempt = 0; attempt < 40; attempt++) {
                    const currentRect = { x: item.x + bounds.w / 2 - r, y: item.y, w: bounds.w, h: bounds.h };
                    const hit = [...pos.values()].find(other => rectsOverlap(currentRect, { x: other.x + other.bounds.w / 2 - other.r, y: other.y, w: other.bounds.w, h: other.bounds.h }));
                    if (!hit) break;
                    const angle = Math.atan2(item.y - cy, item.x - cx) || a;
                    const tangent = angle + Math.PI / 2;
                    const step = 24 + attempt * 1.8;
                    item.x += Math.cos(angle) * step * 0.75 + Math.cos(tangent) * (attempt % 2 === 0 ? 1 : -1) * step * 0.35;
                    item.y += Math.sin(angle) * step * 0.75 + Math.sin(tangent) * (attempt % 2 === 0 ? 1 : -1) * step * 0.35;
                    clampNode(item);
                }
                pos.set(node.id, item);
            });
            const edgePoint = (from, to) => {
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const len = Math.hypot(dx, dy) || 1;
                return { x: from.x + dx / len * from.r, y: from.y + dy / len * from.r };
            };
            const opacity = Math.max(0.55, Math.min(1, Number(settings.graphNodeOpacity || 86) / 100));
            const placedLabels = [];
            const labelCollision = rect => placedLabels.some(item => rectsOverlap(
                { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, w: rect.w, h: rect.h },
                { x: item.x + item.w / 2, y: item.y + item.h / 2, w: item.w, h: item.h },
                4
            ));
            const safeLinks = links.filter(link => pos.has(link.source) && pos.has(link.target));
            const edgeSvg = settings.graphLinksVisible === false ? '' : safeLinks.map((link, index) => {
                const a = pos.get(link.source), b = pos.get(link.target);
                const start = edgePoint(a, b);
                const end = edgePoint(b, a);
                return `<line class="knowledge-link" data-index="${index}" data-source="${escapeHtml(link.source)}" data-target="${escapeHtml(link.target)}" x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="rgba(71,85,105,.72)" stroke-width="1.9" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
            }).join('');
            const edgeOverlaySvg = settings.graphLinksVisible === false ? '' : safeLinks.map((link, index) => {
                const a = pos.get(link.source), b = pos.get(link.target);
                const start = edgePoint(a, b);
                const end = edgePoint(b, a);
                return `<line class="knowledge-link knowledge-link-overlay" data-index="${index}" data-source="${escapeHtml(link.source)}" data-target="${escapeHtml(link.target)}" x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="rgba(30,41,59,.74)" stroke-width="0.9" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
            }).join('');
            const nodeSvg = [...pos.values()].map(({ x, y, r, label, node }) => {
                const text = String(node.label || '');
                const shown = text.length > 10 ? `${text.slice(0, 10)}...` : text;
                const labelW = Math.min(label.w, Math.max(38, shown.length * label.font * 0.68 + 12));
                const labelX = r + 7;
                const rectX = labelX - 6;
                let rectY = -label.h / 2;
                const labelRect = { x: x + rectX, y: y + rectY, w: labelW, h: label.h };
                let collides = labelCollision(labelRect);
                let offset = 0;
                while (collides && offset < 5) {
                    offset++;
                    rectY += (offset % 2 === 0 ? 1 : -1) * offset * (label.h + 3);
                    labelRect.y = y + rectY;
                    collides = labelCollision(labelRect);
                }
                placedLabels.push(labelRect);
                const labelSvg = `<rect class="knowledge-label-bg" x="${rectX}" y="${rectY}" width="${labelW}" height="${label.h}" rx="7" /><text x="${labelX}" y="${rectY + label.h / 2 + label.font / 3}" font-size="${label.font}" font-weight="${node.kind === 'topic' ? 800 : 700}" fill="currentColor">${escapeHtml(shown)}</text>`;
                const nodeGroup = node.group || String(node.id || '').split('::')[0] || state.subject || '';
                return `<g class="knowledge-node" data-id="${escapeHtml(node.id)}" transform="translate(${x} ${y})"><circle cx="0" cy="0" r="${r}" fill="${getSubjectColor(nodeGroup)}" opacity="${opacity}" />${labelSvg}</g>`;
            }).join('');
            const view = { x: -120, y: -80, w: W + 240, h: H + 160 };
            container.innerHTML = `<svg class="knowledge-svg" viewBox="${view.x} ${view.y} ${view.w} ${view.h}" style="width:100%;height:100%;display:block;color:var(--ink);"><g class="knowledge-links">${edgeSvg}${edgeOverlaySvg}</g><g class="knowledge-nodes">${nodeSvg}</g></svg><div class="network-detail" id="networkDetail"><b>知识网络</b>拖拽移动，滚轮缩放。点击节点查看相关题目。</div>`;
            const svg = container.querySelector('.knowledge-svg');
            svg.setAttribute('tabindex', '0');
            svg.setAttribute('role', 'application');
            const nodeById = new Map(nodes.map(node => [node.id, node]));
            const nodeElements = new Map([...container.querySelectorAll('.knowledge-node')].map(el => [el.getAttribute('data-id'), el]));
            const linkElements = [...container.querySelectorAll('.knowledge-link')];
            function svgPoint(event) {
                const rect = svg.getBoundingClientRect();
                return {
                    x: view.x + (event.clientX - rect.left) * (view.w / rect.width),
                    y: view.y + (event.clientY - rect.top) * (view.h / rect.height)
                };
            }
            function applyNetworkView() {
                svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
            }
            function updateNodePosition(id) {
                const item = pos.get(id);
                const el = nodeElements.get(id);
                if (!item || !el) return;
                el.setAttribute('transform', `translate(${item.x} ${item.y})`);
            }
            function updateLinkElement(line) {
                const a = pos.get(line.dataset.source);
                const b = pos.get(line.dataset.target);
                if (!a || !b) return;
                const start = edgePoint(a, b);
                const end = edgePoint(b, a);
                line.setAttribute('x1', start.x);
                line.setAttribute('y1', start.y);
                line.setAttribute('x2', end.x);
                line.setAttribute('y2', end.y);
            }
            function updateLinksFor(id) {
                linkElements.forEach(line => {
                    if (line.dataset.source === id || line.dataset.target === id) updateLinkElement(line);
                });
            }
            function showNetworkNodeDetail(id) {
                const node = nodeById.get(id);
                if (!node) return;
                const questions = (node.questions || []).slice(0, 6).map(q => {
                    const typeText = q.type === 'choice' ? '\u9009\u62e9' : '\u586b\u7a7a';
                    return `<li>L${q.difficulty || '-'} / ${typeText} / ${questionHtml(q, 90)}</li>`;
                }).join('');
                const kindText = node.kind === 'topic' ? '\u9898\u578b/\u77e5\u8bc6\u70b9' : '\u5173\u952e\u8bcd';
                const detail = $('networkDetail');
                detail.innerHTML = `<b>${escapeHtml(node.label)}</b><div>${kindText} / ${node.questionCount || 0} \u9898</div><ul style="padding-left:16px;margin-top:6px;">${questions || '<li>\u6682\u65e0\u9898\u76ee</li>'}</ul>`;
                renderLatex(detail);
            }
            let selectedNetworkIndex = -1;
            const nodeIds = nodes.map(node => node.id);
            function selectNetworkNodeByIndex(index, showDetail = false) {
                if (!nodeIds.length) return;
                selectedNetworkIndex = (index + nodeIds.length) % nodeIds.length;
                const id = nodeIds[selectedNetworkIndex];
                nodeElements.forEach((el, key) => el.classList.toggle('selected', key === id));
                const item = pos.get(id);
                if (item) {
                    const pad = 120;
                    if (item.x < view.x + pad || item.x > view.x + view.w - pad || item.y < view.y + pad || item.y > view.y + view.h - pad) {
                        view.x = item.x - view.w / 2;
                        view.y = item.y - view.h / 2;
                        applyNetworkView();
                    }
                }
                if (showDetail) showNetworkNodeDetail(id);
            }
            function zoomNetwork(factor) {
                const cxView = view.x + view.w / 2;
                const cyView = view.y + view.h / 2;
                view.w *= factor;
                view.h *= factor;
                view.x = cxView - view.w / 2;
                view.y = cyView - view.h / 2;
                applyNetworkView();
            }
            svg.addEventListener('keydown', event => {
                const pan = Math.max(24, view.w * 0.035);
                if (eventMatchesAction(event, 'graph-zoom-in')) { event.preventDefault(); zoomNetwork(0.9); return; }
                if (eventMatchesAction(event, 'graph-zoom-out')) { event.preventDefault(); zoomNetwork(1.1); return; }
                if (event.key === 'Tab') { event.preventDefault(); selectNetworkNodeByIndex(selectedNetworkIndex + (event.shiftKey ? -1 : 1), true); return; }
                if (eventMatchesAction(event, 'graph-node-detail')) { event.preventDefault(); selectNetworkNodeByIndex(selectedNetworkIndex < 0 ? 0 : selectedNetworkIndex, true); return; }
                if (eventMatchesAction(event, 'graph-cancel')) { event.preventDefault(); selectedNetworkIndex = -1; nodeElements.forEach(el => el.classList.remove('selected')); return; }
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    event.preventDefault();
                    view.x += event.key === 'ArrowLeft' ? -pan : event.key === 'ArrowRight' ? pan : 0;
                    view.y += event.key === 'ArrowUp' ? -pan : event.key === 'ArrowDown' ? pan : 0;
                    applyNetworkView();
                }
            });
            let nodeDrag = null;
            let panDrag = null;
            container.querySelectorAll('.knowledge-node').forEach(nodeEl => {
                nodeEl.addEventListener('pointerdown', event => {
                    if (event.button !== 0) return;
                    event.stopPropagation();
                    const id = nodeEl.getAttribute('data-id') || '';
                    nodeElements.forEach(el => el.classList.toggle('selected', el === nodeEl));
                    const item = pos.get(id);
                    if (!item) return;
                    const point = svgPoint(event);
                    nodeDrag = { id, startX: point.x, startY: point.y, nodeX: item.x, nodeY: item.y, moved: false };
                    nodeEl.setPointerCapture(event.pointerId);
                });
                nodeEl.addEventListener('pointermove', event => {
                    if (!nodeDrag) return;
                    event.stopPropagation();
                    const item = pos.get(nodeDrag.id);
                    if (!item) return;
                    const point = svgPoint(event);
                    const dx = point.x - nodeDrag.startX;
                    const dy = point.y - nodeDrag.startY;
                    if (Math.hypot(dx, dy) > 3) nodeDrag.moved = true;
                    item.x = nodeDrag.nodeX + dx;
                    item.y = nodeDrag.nodeY + dy;
                    clampNode(item);
                    updateNodePosition(nodeDrag.id);
                    updateLinksFor(nodeDrag.id);
                });
                nodeEl.addEventListener('pointerup', event => {
                    event.stopPropagation();
                    if (nodeDrag && !nodeDrag.moved) showNetworkNodeDetail(nodeDrag.id);
                    nodeDrag = null;
                });
                nodeEl.addEventListener('pointercancel', () => { nodeDrag = null; });
            });
            svg.addEventListener('pointerdown', event => {
                if (event.button !== 0 || event.target.closest('.knowledge-node')) return;
                nodeElements.forEach(el => el.classList.remove('selected'));
                panDrag = { x: event.clientX, y: event.clientY };
                svg.classList.add('dragging');
                svg.setPointerCapture(event.pointerId);
            });
            svg.addEventListener('pointermove', event => {
                if (!panDrag) return;
                const rect = svg.getBoundingClientRect();
                view.x -= (event.clientX - panDrag.x) * (view.w / rect.width);
                view.y -= (event.clientY - panDrag.y) * (view.h / rect.height);
                panDrag = { x: event.clientX, y: event.clientY };
                applyNetworkView();
            });
            const stopPan = () => {
                panDrag = null;
                svg.classList.remove('dragging');
            };
            svg.addEventListener('pointerup', stopPan);
            svg.addEventListener('pointercancel', stopPan);
            svg.addEventListener('wheel', event => {
                event.preventDefault();
                const factor = event.deltaY < 0 ? 0.9 : 1.1;
                const rect = svg.getBoundingClientRect();
                const px = view.x + (event.clientX - rect.left) / rect.width * view.w;
                const py = view.y + (event.clientY - rect.top) / rect.height * view.h;
                view.w *= factor;
                view.h *= factor;
                view.x = px - (event.clientX - rect.left) / rect.width * view.w;
                view.y = py - (event.clientY - rect.top) / rect.height * view.h;
                applyNetworkView();
            }, { passive: false });
        }

        // Export the current statistics view to PDF using html2canvas and jsPDF.
        // We render the stats screen first, capture it as an image, then embed
        // it in a PDF document. Falls back to window.print() if libraries fail.
        async function exportStatsPdf() {
            renderStatsScreen();
            const content = $('statsContent');
            if (!content || !content.innerHTML.trim()) {
                alert('暂无统计数据可导出。');
                return;
            }

            // Check if libraries are loaded
            if (!window.html2canvas || !window.jspdf) {
                console.warn('PDF libraries not loaded, falling back to print');
                setTimeout(() => window.print(), 60);
                return;
            }

            let tempDiv = null;
            try {
                // Create a temporary container with white background for PDF
                tempDiv = document.createElement('div');
                tempDiv.style.cssText = 'position:fixed;left:-9999px;top:0;width:900px;background:#fff;padding:24px;color:#000;font-family:"Noto Sans SC","Source Han Sans SC",sans-serif;';
                
                // Clone the content
                const clone = content.cloneNode(true);
                
                // Fix styles for PDF rendering - ensure visibility on white background
                clone.querySelectorAll('.stats-panel, .stats-mini, .stats-coverage').forEach(el => {
                    el.style.background = '#fff';
                    el.style.border = '1px solid #ddd';
                    el.style.color = '#000';
                });
                clone.querySelectorAll('.stats-mini .label, .stats-panel h3, .stats-panel h4, .coverage-section h4').forEach(el => {
                    el.style.color = '#1E293B';
                });
                clone.querySelectorAll('.stats-mini .value').forEach(el => {
                    el.style.color = '#1B6B93';
                });
                clone.querySelectorAll('.stats-table th').forEach(el => {
                    el.style.background = '#f5f5f5';
                    el.style.color = '#000';
                });
                clone.querySelectorAll('.stats-table td').forEach(el => {
                    el.style.color = '#000';
                    el.style.borderBottom = '1px solid #eee';
                });
                clone.querySelectorAll('.stats-bar').forEach(el => {
                    el.style.background = '#e0e0e0';
                });
                clone.querySelectorAll('.stats-bar i').forEach(el => {
                    el.style.background = '#4FCCA3';
                });
                clone.querySelectorAll('.stats-row b').forEach(el => {
                    el.style.color = '#000';
                });
                clone.querySelectorAll('.legend span').forEach(el => {
                    el.style.color = '#000';
                });
                clone.querySelectorAll('#knowledgeNetwork').forEach(el => {
                    el.style.display = 'none';
                });
                
                tempDiv.appendChild(clone);
                document.body.appendChild(tempDiv);

                // Capture as canvas
                const canvas = await window.html2canvas(tempDiv, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });
                
                tempDiv.remove();
                tempDiv = null;

                // Create PDF
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                
                // Add title
                doc.setFontSize(18);
                doc.setTextColor(27, 107, 147); // ocean color
                doc.text('FocusMath Stats Report', pdfWidth / 2, 15, { align: 'center' });
                
                doc.setFontSize(10);
                doc.setTextColor(100, 116, 139); // ink-light
                doc.text(new Date().toISOString().replace('T', ' ').slice(0, 19), pdfWidth / 2, 22, { align: 'center' });
                
                const startY = 30;
                const marginX = 8;
                const usableWidth = pdfWidth - marginX * 2;
                const firstUsableHeight = pageHeight - startY - 10;
                const nextUsableHeight = pageHeight - 20;
                const pxPerMm = canvas.width / usableWidth;
                let sourceY = 0;
                let page = 0;
                while (sourceY < canvas.height) {
                    const targetY = page === 0 ? startY : 10;
                    const targetHeight = page === 0 ? firstUsableHeight : nextUsableHeight;
                    const sliceHeight = Math.min(canvas.height - sourceY, Math.floor(targetHeight * pxPerMm));
                    const slice = document.createElement('canvas');
                    slice.width = canvas.width;
                    slice.height = sliceHeight;
                    slice.getContext('2d').drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
                    if (page > 0) doc.addPage();
                    doc.addImage(slice.toDataURL('image/png'), 'PNG', marginX, targetY, usableWidth, sliceHeight / pxPerMm);
                    sourceY += sliceHeight;
                    page++;
                }
                
                doc.save('FocusMath-stats-report.pdf');
            } catch (error) {
                if (tempDiv) tempDiv.remove();
                console.error('PDF export failed:', error);
                alert('PDF 导出失败，正在使用打印对话框作为备用方案。');
                setTimeout(() => window.print(), 60);
            }
        }

        // ---- Mind map ----
            // Build a radial mind map of subject -> topic, with topic nodes
        // colored by mastery level. Hovering a node shows a tooltip with
        // answered/correct/accuracy and mastery label.
        function masteryLevel(acc, answered) {
            if (!answered) return { label: '未练习', color: '#94A3B8', level: 0 };
            if (acc >= 0.8) return { label: '精通', color: '#22C55E', level: 4 };
            if (acc >= 0.6) return { label: '熟练', color: '#84CC16', level: 3 };
            if (acc >= 0.4) return { label: '一般', color: '#F5A623', level: 2 };
            return { label: '薄弱', color: '#F47068', level: 1 };
        }

        function buildMindmapData() {
            const data = [];
            subjectKeys().forEach(subject => {
                const rules = (topicRules[subject] && topicRules[subject].length) ? topicRules[subject] : (fallbackQuestionMeta.topicRules?.[subject] || []);
                const topics = rules.map(([topic]) => topic);
                const topicNodes = topics.map(topic => {
                    const stat = state.topicStats[topicKey(subject, topic)] || {};
                    const answered = stat.answered || 0;
                    const correct = stat.correct || 0;
                    const acc = answered ? correct / answered : 0;
                    const m = masteryLevel(acc, answered);
                    return { subject, topic, answered, correct, acc, mastery: m };
                });
                // Subject-level aggregate mastery (avg accuracy weighted by answered).
                const totAns = topicNodes.reduce((s, n) => s + n.answered, 0);
                const totCor = topicNodes.reduce((s, n) => s + n.correct, 0);
                const subjAcc = totAns ? totCor / totAns : 0;
                const subjMastery = masteryLevel(subjAcc, totAns);
                data.push({ subject, name: getSubjectName(subject), color: getSubjectColor(subject), mastery: subjMastery, answered: totAns, correct: totCor, acc: subjAcc, topics: topicNodes });
            });
            return data;
        }

        function renderMindmap() {
            const container = $('mindmapContainer');
            if (!container) return;
            const data = buildMindmapData();
            const W = 920, H = 560;
            const cx = W / 2, cy = H / 2;
            const subjRadius = 120;
            const topicRadius = 88;

            // Tooltip element
            let tooltip = container.querySelector('.mm-tooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'mm-tooltip';
                container.appendChild(tooltip);
            }

            const subjects = data;
            const svgParts = [];
            
            const nodes = [];
            const minDistance = 14;
            const rectEdgePoint = (from, to, width, height) => {
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                if (!dx && !dy) return { x: from.x, y: from.y };
                const scale = Math.min((width / 2) / Math.max(Math.abs(dx), 0.001), (height / 2) / Math.max(Math.abs(dy), 0.001));
                return { x: from.x + dx * scale, y: from.y + dy * scale };
            };
            const linkPath = (from, to, fromSize, toSize, cls = 'mm-link') => {
                const a = rectEdgePoint(from, to, fromSize.w, fromSize.h);
                const b = rectEdgePoint(to, from, toSize.w, toSize.h);
                return `<path class="${cls}" d="M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 - (cls.includes('main') ? 18 : 0)} ${b.x} ${b.y}" />`;
            };
            
            // Detect whether two rectangle nodes overlap.
            function checkOverlap(a, b) {
                return !(a.x + a.width / 2 + minDistance < b.x - b.width / 2 ||
                         a.x - a.width / 2 - minDistance > b.x + b.width / 2 ||
                         a.y + a.height / 2 + minDistance < b.y - b.height / 2 ||
                         a.y - a.height / 2 - minDistance > b.y + b.height / 2);
            }
            
            // 璋冩暣鑺傜偣浣嶇疆閬垮厤閲嶅彔
            function adjustPosition(x, y, size, existingNodes) {
                let adjusted = {x, y, width: size.w, height: size.h};
                let attempts = 0;
                const maxAttempts = 22;
                
                while (attempts < maxAttempts) {
                    let hasOverlap = false;
                    for (let node of existingNodes) {
                        if (checkOverlap(adjusted, node)) {
                            hasOverlap = true;
                            const angle = Math.atan2(adjusted.y - cy, adjusted.x - cx);
                            adjusted.x += Math.cos(angle) * 18;
                            adjusted.y += Math.sin(angle) * 18;
                            break;
                        }
                    }
                    if (!hasOverlap) break;
                    attempts++;
                }
                return adjusted;
            }
            
            // Calculate final node positions before drawing links. Topic nodes
            // can be nudged to avoid overlap, so links must use the final coords.
            nodes.push({x: cx, y: cy, width: 160, height: 58});
            const layoutSlots = [
                { x: cx, y: 132, topicX: cx, topicY: 48, cols: 3, dx: 188, dy: 46 },
                { x: 292, y: 372, topicX: 210, topicY: 456, cols: 2, dx: 188, dy: 46 },
                { x: 628, y: 372, topicX: 710, topicY: 456, cols: 2, dx: 188, dy: 46 }
            ];
            subjects.forEach((subj, si) => {
                const slot = layoutSlots[si] || {
                    x: cx + Math.cos((si / subjects.length) * Math.PI * 2) * 210,
                    y: cy + Math.sin((si / subjects.length) * Math.PI * 2) * 160,
                    topicX: cx + Math.cos((si / subjects.length) * Math.PI * 2) * 300,
                    topicY: cy + Math.sin((si / subjects.length) * Math.PI * 2) * 210,
                    cols: 2,
                    dx: 188,
                    dy: 46
                };
                const sx = slot.x;
                const sy = slot.y;
                subj._mm = { x: sx, y: sy, w: 132, h: 44, angle: 0 };
                nodes.push({x: sx, y: sy, width: 132, height: 44});
                const topics = subj.topics;
                topics.forEach((tn, ti) => {
                    const cols = Math.max(1, Math.min(slot.cols, topics.length));
                    const rows = Math.ceil(topics.length / cols);
                    const row = Math.floor(ti / cols);
                    const col = ti % cols;
                    const itemsInRow = row === rows - 1 ? topics.length - row * cols : cols;
                    const rowCenterOffset = (itemsInRow - 1) / 2;
                    let tx = slot.topicX + (col - rowCenterOffset) * slot.dx;
                    let ty = slot.topicY + (row - (rows - 1) / 2) * slot.dy;
                    const nodeW = Math.min(160, Math.max(94, tn.topic.length * 13 + 24));
                    tn._mm = { x: tx, y: ty, w: nodeW, h: 36 };
                    nodes.push({x: tx, y: ty, width: nodeW, height: 36});
                });
            });

            // Links first (so they render under nodes)
            subjects.forEach(subj => {
                const s = subj._mm;
                if (!s) return;
                svgParts.push(linkPath({ x: cx, y: cy }, s, { w: 160, h: 58 }, { w: s.w, h: s.h }, 'mm-link mm-link-main'));
                subj.topics.forEach(tn => {
                    if (!tn._mm) return;
                    svgParts.push(linkPath(s, tn._mm, { w: s.w, h: s.h }, { w: tn._mm.w, h: tn._mm.h }));
                });
            });

            // Center node
            svgParts.push(`<g class="mm-node" data-tip="FocusMath 掌握图谱|按各题型掌握程度自动构建|共 ${subjects.reduce((s, x) => s + x.topics.length, 0)} 个题型节点">`);
            svgParts.push(`<rect class="mm-rect" x="${cx - 80}" y="${cy - 29}" width="160" height="58" fill="#0F172A" />`);
            svgParts.push(`<text class="mm-label mm-label-center" x="${cx}" y="${cy - 6}">FocusMath</text>`);
            svgParts.push(`<text class="mm-label mm-label-center" x="${cx}" y="${cy + 12}" style="font-size:11px;fill:#94A3B8">\u638c\u63e1\u56fe\u8c31</text>`);
            svgParts.push(`</g>`);

            // Subject + topic nodes
            const mmOpacity = Math.max(0.55, Math.min(1, Number(settings.mindmapNodeOpacity || 88) / 100));
            subjects.forEach((subj) => {
                const s = subj._mm || { x: cx, y: cy, w: 132, h: 44, angle: 0 };
                const sx = s.x;
                const sy = s.y;
                
                const subjTip = `${subj.name}|\u638c\u63e1\u5ea6 ${subj.mastery.label}|\u5df2\u7b54 ${subj.answered} \u9898 \u00B7 \u6b63\u786e ${subj.correct} \u9898 \u00B7 \u6b63\u786e\u7387 ${subj.acc ? Math.round(subj.acc * 100) : 0}%`;
                svgParts.push(`<g class="mm-node" data-tip="${escapeHtml(subjTip)}">`);
                svgParts.push(`<rect class="mm-rect" x="${sx - 66}" y="${sy - 22}" width="132" height="44" fill="${subj.color}" opacity="${mmOpacity}" />`);
                svgParts.push(`<text class="mm-label mm-label-subject" x="${sx}" y="${sy}">${subj.name}</text>`);
                svgParts.push(`</g>`);

                const topics = subj.topics;
                topics.forEach((tn) => {
                    const p = tn._mm || { x: sx, y: sy, w: Math.max(94, tn.topic.length * 13 + 24), h: 36 };
                    const tx = p.x;
                    const ty = p.y;
                    const accPct = tn.acc ? Math.round(tn.acc * 100) : 0;
                    const tip = `${subj.name} / ${tn.topic}|掌握：${tn.mastery.label}，${accPct}%|答题 ${tn.answered} · 答对 ${tn.correct}`;
                    const nodeW = p.w;
                    const topicLabel = tn.topic.length > 8 ? `${tn.topic.slice(0, 8)}...` : tn.topic;
                    
                    svgParts.push(`<g class="mm-node" data-tip="${escapeHtml(tip)}">`);
                    svgParts.push(`<rect class="mm-rect" x="${tx - nodeW / 2}" y="${ty - 18}" width="${nodeW}" height="36" fill="${tn.mastery.color}" opacity="${mmOpacity}" />`);
                    svgParts.push(`<text class="mm-label" x="${tx}" y="${ty}">${escapeHtml(topicLabel)}</text>`);
                    svgParts.push(`</g>`);
                });
            });

            const bounds = nodes.reduce((box, node) => ({
                minX: Math.min(box.minX, node.x - node.width / 2),
                minY: Math.min(box.minY, node.y - node.height / 2),
                maxX: Math.max(box.maxX, node.x + node.width / 2),
                maxY: Math.max(box.maxY, node.y + node.height / 2)
            }), { minX: cx - 80, minY: cy - 29, maxX: cx + 80, maxY: cy + 29 });
            const pad = 52;
            const view = { x: bounds.minX - pad, y: bounds.minY - pad, w: (bounds.maxX - bounds.minX) + pad * 2, h: (bounds.maxY - bounds.minY) + pad * 2 };
            container.innerHTML = `<svg class="mindmap-svg" viewBox="${view.x} ${view.y} ${view.w} ${view.h}" preserveAspectRatio="xMidYMid meet">${svgParts.join('')}</svg>`;
            // Re-append tooltip (container.innerHTML cleared it)
            container.appendChild(tooltip);
            const mindmapSvg = container.querySelector('.mindmap-svg');
            mindmapSvg?.setAttribute('tabindex', '0');
            mindmapSvg?.setAttribute('role', 'application');
            bindMindmapPan(mindmapSvg, view);
            let mmKeyboardIndex = -1;

            // Bind hover events
            container.querySelectorAll('.mm-node').forEach(node => {
                node.setAttribute('tabindex', '0');
                node.addEventListener('mouseenter', e => {
                    const raw = node.getAttribute('data-tip') || '';
                    const parts = raw.split('|');
                    const title = parts[0] || '';
                    const lines = parts.slice(1);
                    tooltip.innerHTML = `<div class="mm-tip-title">${htmlWithMath(title)}</div>${lines.map(l => `<div>${htmlWithMath(l)}</div>`).join('')}`;
                    renderLatex(tooltip);
                    tooltip.classList.add('show');
                });
                node.addEventListener('mousemove', e => {
                    const rect = container.getBoundingClientRect();
                    let x = e.clientX - rect.left + 14;
                    let y = e.clientY - rect.top + 14;
                    // Keep tooltip inside container
                    if (x + 250 > rect.width) x = e.clientX - rect.left - 254;
                    if (y + 100 > rect.height) y = e.clientY - rect.top - 90;
                    tooltip.style.left = x + 'px';
                    tooltip.style.top = y + 'px';
                });
                node.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
                node.addEventListener('keydown', e => {
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    node.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                });
            });
            mindmapSvg?.addEventListener('keydown', event => {
                const step = Math.max(20, view.w * 0.035);
                const apply = () => mindmapSvg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
                if (eventMatchesAction(event, 'graph-zoom-in')) {
                    event.preventDefault();
                    const cxView = view.x + view.w / 2, cyView = view.y + view.h / 2;
                    view.w *= 0.9; view.h *= 0.9; view.x = cxView - view.w / 2; view.y = cyView - view.h / 2; apply();
                    return;
                }
                if (eventMatchesAction(event, 'graph-zoom-out')) {
                    event.preventDefault();
                    const cxView = view.x + view.w / 2, cyView = view.y + view.h / 2;
                    view.w *= 1.1; view.h *= 1.1; view.x = cxView - view.w / 2; view.y = cyView - view.h / 2; apply();
                    return;
                }
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    event.preventDefault();
                    view.x += event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
                    view.y += event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
                    apply();
                    return;
                }
                if (event.key === 'Tab') {
                    const nodes = Array.from(container.querySelectorAll('.mm-node'));
                    if (!nodes.length) return;
                    event.preventDefault();
                    mmKeyboardIndex = (mmKeyboardIndex + (event.shiftKey ? -1 : 1) + nodes.length) % nodes.length;
                    focusKeyboardTarget(nodes[mmKeyboardIndex]);
                    nodes[mmKeyboardIndex].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                }
            });
        }

        function bindMindmapPan(svg, view) {
            if (!svg) return;
            let dragging = false;
            let last = null;
            const apply = () => svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
            svg.addEventListener('pointerdown', event => {
                if (event.button !== 0) return;
                dragging = true;
                last = { x: event.clientX, y: event.clientY };
                svg.classList.add('dragging');
                svg.setPointerCapture(event.pointerId);
            });
            svg.addEventListener('pointermove', event => {
                if (!dragging || !last) return;
                const rect = svg.getBoundingClientRect();
                view.x -= (event.clientX - last.x) * (view.w / rect.width);
                view.y -= (event.clientY - last.y) * (view.h / rect.height);
                last = { x: event.clientX, y: event.clientY };
                apply();
            });
            const stop = () => {
                dragging = false;
                last = null;
                svg.classList.remove('dragging');
            };
            svg.addEventListener('pointerup', stop);
            svg.addEventListener('pointercancel', stop);
            svg.addEventListener('wheel', event => {
                event.preventDefault();
                const factor = event.deltaY < 0 ? 0.9 : 1.1;
                const rect = svg.getBoundingClientRect();
                const px = view.x + (event.clientX - rect.left) / rect.width * view.w;
                const py = view.y + (event.clientY - rect.top) / rect.height * view.h;
                view.w *= factor;
                view.h *= factor;
                view.x = px - (event.clientX - rect.left) / rect.width * view.w;
                view.y = py - (event.clientY - rect.top) / rect.height * view.h;
                apply();
            }, { passive: false });
        }

        function csvEscape(value) {
            return `"${String(value ?? '').replace(/"/g, '""')}"`;
        }

        function svgToPng(svg, filename) {
            const xml = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                const rect = svg.viewBox.baseVal;
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(rect.width || svg.clientWidth || 960));
                canvas.height = Math.max(1, Math.round(rect.height || svg.clientHeight || 520));
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                URL.revokeObjectURL(url);
                canvas.toBlob(out => {
                    const a = document.createElement('a');
                    const outUrl = URL.createObjectURL(out);
                    a.href = outUrl;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(outUrl);
                }, 'image/png');
            };
            img.src = url;
        }

        function exportSvgElement(svg, filename, format, data = null) {
            if (!svg && !data) return;
            if (format === 'png' && svg) return svgToPng(svg, filename.replace(/\.\w+$/, '.png'));
            if (format === 'svg' && svg) {
                downloadText(filename.replace(/\.\w+$/, '.svg'), new XMLSerializer().serializeToString(svg), 'image/svg+xml;charset=utf-8');
                return;
            }
            const graph = data || { nodes: [], links: [] };
            if (format === 'json') {
                downloadText(filename.replace(/\.\w+$/, '.json'), JSON.stringify(graph, null, 2), 'application/json;charset=utf-8');
            } else if (format === 'csv') {
                const nodeRows = ['kind,id,label,group,count'].concat((graph.nodes || []).map(n => [n.kind || 'node', n.id, n.label, n.group, n.questionCount || 0].map(csvEscape).join(',')));
                const linkRows = ['source,target,relation'].concat((graph.links || []).map(l => [l.source, l.target, l.relation].map(csvEscape).join(',')));
                downloadText(filename.replace(/\.\w+$/, '.csv'), `${nodeRows.join('\n')}\n\n${linkRows.join('\n')}`, 'text/csv;charset=utf-8');
            } else {
                const lines = (graph.nodes || []).map(n => `- ${n.label || n.id}: ${n.questionCount || 0} 题`);
                downloadText(filename.replace(/\.\w+$/, '.md'), `# FocusMath 图谱\n\n${lines.join('\n')}\n`, 'text/markdown;charset=utf-8');
            }
        }

        function exportMindmap() {
            renderMindmap();
            const svg = document.querySelector('#mindmapContainer .mindmap-svg');
            const data = { nodes: buildMindmapData(), links: [] };
            exportSvgElement(svg, `focusmath-mindmap.${$('mindmapExportFormat')?.value || settings.graphExportFormat || 'svg'}`, $('mindmapExportFormat')?.value || settings.graphExportFormat || 'svg', data);
        }

        function exportKnowledgeNetwork() {
            const format = $('networkExportFormat')?.value || settings.graphExportFormat || 'svg';
            const svg = document.querySelector('#knowledgeNetwork .knowledge-svg');
            exportSvgElement(svg, `focusmath-knowledge-network.${format}`, format, latestKnowledgeGraph || localKnowledgeGraph());
        }

        function topicAccuracy(subject, topic) {
            const stat = state.topicStats[topicKey(subject, topic)];
            if (!stat || !stat.answered) return 0.35;
            return stat.correct / stat.answered;
        }

        function getAllQuestions(subject) {
            const cacheKey = `${subject}:${state.customQuestions?.length || 0}`;
            if (questionListCache[cacheKey]) return questionListCache[cacheKey];
            // questionDB is hydrated from the IndexedDB store on startup (see
            // initDatabase). Custom questions live in user state and are merged
            // in here so user-added items appear in the bank and quizzes.
            const builtIn = uniqueQuestionList(questionDB[subject] || []).map(q => ({ ...q, subject, question: stripLeadingSubjectPrefix(q.question) }));
            const custom = (state.customQuestions || []).filter(q => q.subject === subject);
            questionListCache[cacheKey] = uniqueQuestionList([...builtIn, ...custom.map(q => ({ ...q, question: stripLeadingSubjectPrefix(q.question) }))]);
            return questionListCache[cacheKey];
        }

        function normalizeStem(text) {
            return String(text).replace(/\s+/g, '').toLowerCase();
        }

        function uniqueQuestionList(questions) {
            const seen = new Set();
            const out = [];
            questions.forEach(q => {
                const key = normalizeStem(q.question);
                if (seen.has(key)) return;
                seen.add(key);
                out.push(q);
            });
            return out;
        }

        function similarQuestionList(questions, threshold = 0.8, limit = Infinity) {
            const out = [];
            for (const q of questions) {
                if (out.some(item => stemSimilarity(item.question, q.question) > threshold)) continue;
                out.push(q);
                if (out.length >= limit) break;
            }
            return out;
        }

        // Ensure choice:fill >= 3:2 (choice >= 60%). If there are too many fill
        // questions, drop the trailing fill entries until the ratio is met. This
        // keeps the bank compliant with the required type ratio after dedup.
        function balanceChoiceFill(questions, ratio = 3 / 2) {
            const choice = questions.filter(q => q.type === 'choice');
            const fill = questions.filter(q => q.type === 'fill');
            if (!fill.length || !choice.length) return questions;
            if (choice.length / fill.length >= ratio) return questions;
            const maxFill = Math.floor(choice.length / ratio);
            const keptFill = fill.slice(0, Math.max(0, maxFill));
            // Re-interleave by original order so subjects stay mixed.
            const fillIds = new Set(keptFill.map(q => q.id));
            return questions.filter(q => q.type !== 'fill' || fillIds.has(q.id));
        }

        function dedupeBankQuestions(questions) {
            const groups = new Map();
            questions.forEach(q => {
                const key = normalizeStem(q.question) + '|' + q.type;
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key).push(q);
            });

            const out = [];
            groups.forEach(group => {
                if (group[0].type === 'choice') {
                    const rep = { ...group[0], variants: group };
                    out.push(rep);
                } else {
                    // Fill-in: keep only the first to avoid identical or near-identical stems.
                    out.push(group[0]);
                }
            });

            // ===================================================
            return out;
        }

        const questionListCache = {};
        const bankListCache = new Map();
        const bankTopicCache = new Map();
        const bankIndexCache = new Map();
        const bankPageCache = new Map();
        const bankRemotePageCache = new Map();
        const bankRemoteMetaCache = new Map();
        const DEFAULT_BANK_PAGE_SIZE = 60;
        const BANK_PRELOAD_PAGES = 5;
        function bankPageSize() {
            const value = Math.round((Number(settings.bankPageSize) || DEFAULT_BANK_PAGE_SIZE) / 5) * 5;
            return Math.max(20, Math.min(100, value));
        }
        let bankRemoteMeta = { total: 0, pages: 1, pageSize: DEFAULT_BANK_PAGE_SIZE, subject: '', revision: '' };
        let bankRemoteRequest = null;
        let bankRemoteLoadingKey = '';
        let bankRemoteError = '';
        const questionInfoCache = new Map();
        const shingleCache = new Map();
        let latestKnowledgeGraph = null;
        let autoImportCandidates = [];
        let bankSearchTimer = null;
        let questionScoreRevision = 0;
        const autoImportSelected = new Set();

        function getShingles(text) {
            const clean = normalizeStem(text).replace(/[^\u4e00-\u9fa5a-z0-9]/g, '');
            if (shingleCache.has(clean)) return shingleCache.get(clean);
            const set = new Set();
            const size = clean.length < 8 ? 2 : 3;
            for (let i = 0; i <= clean.length - size; i++) set.add(clean.slice(i, i + size));
            shingleCache.set(clean, set);
            return set;
        }

        function stemSimilarity(a, b) {
            const sa = getShingles(a), sb = getShingles(b);
            if (!sa.size || !sb.size) return 0;
            let hit = 0;
            sa.forEach(x => { if (sb.has(x)) hit++; });
            return hit / (sa.size + sb.size - hit);
        }

        function generateSubjectQuestions(subject) {
            const targets = { calculus: 1010, linear: 1010, probability: 1010 };
            const base = uniqueQuestionList(questionDB[subject] || []);
            const need = Math.max(0, (targets[subject] || 330) - base.length);
            if (!need) return [];
            const out = [];
            const seen = new Set(base.map(q => normalizeStem(q.question)));
            const subjectTitle = getSubjectName(subject);
            const sources = ['\u6559\u6750\u6539\u7f16', '\u8003\u7814\u771f\u9898', '\u6a21\u62df\u5377', '\u8ba1\u7b97\u8bad\u7ec3', '\u6982\u5ff5\u8fa8\u6790', '\u57fa\u7840\u9898', '\u63d0\u5347\u9898', '\u7efc\u5408\u9898', '\u4f8b\u9898\u6539\u7f16', '\u77e5\u8bc6\u70b9\u7ec3\u4e60'];
            const templates = {
                calculus: [
                    i => ({ type: 'choice', question: '\u6c42 f(x)=x^' + ((i % 6) + 2) + ' \u5728 x=1 \u5904\u7684\u5bfc\u6570', options: [String((i % 6) + 2), '0', '1', String((i % 6) + 3)], answer: 0, topic: '\u5bfc\u6570' }),
                    i => ({ type: 'fill', question: '\u8ba1\u7b97 \\int_0^1 ' + ((i % 5) + 1) + 'x\\,dx', answer: String(((i % 5) + 1) / 2), topic: '\u5b9a\u79ef\u5206' }),
                    i => ({ type: 'choice', question: '\u5224\u65ad\u7ea7\u6570 \\sum 1/n^' + ((i % 3) + 2) + ' \u7684\u655b\u6563\u6027', options: ['\u6536\u655b', '\u53d1\u6563', '\u65e0\u6cd5\u5224\u65ad', '\u6761\u4ef6\u6536\u655b'], answer: 0, topic: '\u7ea7\u6570' }),
                    i => ({ type: 'fill', question: '\u6c42\u6781\u9650 \\lim_{x\\to 0} \\frac{\\sin ' + ((i % 6) + 1) + 'x}{x}', answer: String((i % 6) + 1), topic: '\u6781\u9650' }),
                    i => ({ type: 'choice', question: '\u51fd\u6570 f(x)=e^{' + ((i % 4) + 1) + 'x} \u7684\u4e00\u9636\u5bfc\u6570\u662f', options: [((i % 4) + 1) + 'e^{' + ((i % 4) + 1) + 'x}', 'e^x', '0', 'x'], answer: 0, topic: '\u5bfc\u6570' }),
                    i => ({ type: 'fill', question: '\u8ba1\u7b97 \\int_0^1 x^' + ((i % 5) + 1) + '\\,dx', answer: '1/' + ((i % 5) + 2), topic: '\u5b9a\u79ef\u5206' }),
                    i => ({ type: 'choice', question: '\u66f2\u7ebf y=x^' + ((i % 4) + 2) + ' \u5728 x=1 \u5904\u7684\u5207\u7ebf\u659c\u7387\u4e3a', options: [String((i % 4) + 2), '1', '0', String((i % 4) + 3)], answer: 0, topic: '\u5207\u7ebf' }),
                    i => ({ type: 'fill', question: '\u5fae\u5206\u65b9\u7a0b y\\prime=' + ((i % 5) + 1) + 'x \u7684\u4e00\u4e2a\u539f\u51fd\u6570\u4e3a C=0 \u65f6 y=', answer: ((i % 5) + 1) + 'x^2/2', topic: '\u5fae\u5206\u65b9\u7a0b' }),
                    i => ({ type: 'choice', question: '\u4e8c\u91cd\u79ef\u5206 \\iint_D ' + ((i % 4) + 1) + '\\,dA \u4e2d D \u7684\u9762\u79ef\u4e3a 2 \u65f6\u7ed3\u679c\u662f', options: [String(((i % 4) + 1) * 2), String((i % 4) + 1), '0', '1'], answer: 0, topic: '\u4e8c\u91cd\u79ef\u5206' }),
                    i => ({ type: 'fill', question: '\u5e42\u7ea7\u6570 \\sum x^n/' + ((i % 5) + 2) + '^n \u7684\u6536\u655b\u534a\u5f84\u662f', answer: String((i % 5) + 2), topic: '\u5e42\u7ea7\u6570' }),
                    i => ({ type: 'choice', question: '\u51fd\u6570 z=x^2+' + ((i % 5) + 1) + 'y^2 \u5bf9 y \u7684\u504f\u5bfc\u6570\u4e3a', options: ['2' + ((i % 5) + 1) + 'y', '2x', '0', 'y'], answer: 0, topic: '\u504f\u5bfc\u6570' })
                ],
                linear: [
                    i => ({ type: 'choice', question: '\u6c42 diag(' + ((i % 7) + 1) + ',' + ((i % 5) + 2) + ') \u7684\u884c\u5217\u5f0f', options: [String(((i % 7) + 1) * ((i % 5) + 2)), String((i % 7) + (i % 5) + 3), '0', '1'], answer: 0, topic: '\u884c\u5217\u5f0f' }),
                    i => ({ type: 'fill', question: '\u4e09\u9636\u5355\u4f4d\u77e9\u9635\u7684\u79e9\u662f\u591a\u5c11?', answer: '3', topic: '\u77e9\u9635\u7684\u79e9' }),
                    i => ({ type: 'choice', question: '\u65b9\u9635\u53ef\u9006\u7684\u5145\u8981\u6761\u4ef6\u662f', options: ['\u884c\u5217\u5f0f\u4e0d\u4e3a0', '\u8ff9\u4e3a0', '\u5143\u7d20\u5168\u4e3a\u6b63', '\u79e9\u4e3a0'], answer: 0, topic: '\u53ef\u9006\u77e9\u9635' }),
                    i => ({ type: 'fill', question: '\u5411\u91cf (' + ((i % 5) + 1) + ',0,0) \u7684\u6a21\u957f\u662f', answer: String((i % 5) + 1), topic: '\u5411\u91cf\u6a21' }),
                    i => ({ type: 'choice', question: '\u4e8c\u9636\u77e9\u9635 [[1,' + ((i % 5) + 1) + '],[0,1]] \u7684\u7279\u5f81\u503c\u662f', options: ['1,1', '0,1', '1,' + ((i % 5) + 1), '0,0'], answer: 0, topic: '\u7279\u5f81\u503c' }),
                    i => ({ type: 'fill', question: '\u77e9\u9635 A \u4e3a ' + ((i % 4) + 2) + ' \u9636\u6ee1\u79e9\u65f6 rank(A)=', answer: String((i % 4) + 2), topic: '\u79e9' }),
                    i => ({ type: 'choice', question: '\u5bf9\u89d2\u77e9\u9635 diag(' + ((i % 6) + 1) + ',' + ((i % 6) + 2) + ') \u7684\u8ff9\u4e3a', options: [String(((i % 6) + 1) + ((i % 6) + 2)), String(((i % 6) + 1) * ((i % 6) + 2)), '0', '1'], answer: 0, topic: '\u77e9\u9635\u7684\u8ff9' }),
                    i => ({ type: 'fill', question: '\u7ebf\u6027\u65b9\u7a0b\u7ec4 Ax=0 \u4e2d A \u4e3a ' + ((i % 4) + 2) + ' \u9636\u53ef\u9006\u77e9\u9635\u65f6\u89e3\u7a7a\u95f4\u7ef4\u6570\u662f', answer: '0', topic: '\u7ebf\u6027\u65b9\u7a0b\u7ec4' }),
                    i => ({ type: 'choice', question: '\u4e8c\u6b21\u578b ' + ((i % 5) + 1) + 'x^2+' + ((i % 4) + 1) + 'y^2 \u7684\u6b63\u5b9a\u6027\u4e3a', options: ['\u6b63\u5b9a', '\u8d1f\u5b9a', '\u4e0d\u5b9a', '\u534a\u6b63\u5b9a'], answer: 0, topic: '\u4e8c\u6b21\u578b' }),
                    i => ({ type: 'fill', question: '\u4e24\u4e2a\u7ebf\u6027\u65e0\u5173\u5411\u91cf\u5f20\u6210\u7a7a\u95f4\u7684\u7ef4\u6570\u662f', answer: '2', topic: '\u7ebf\u6027\u65e0\u5173' }),
                    i => ({ type: 'choice', question: '\u521d\u7b49\u884c\u53d8\u6362\u4e0d\u6539\u53d8\u77e9\u9635\u7684', options: ['\u79e9', '\u5143\u7d20\u548c', '\u6240\u6709\u7279\u5f81\u503c', '\u884c\u5217\u5f0f\u503c\u5fc5\u4e0d\u53d8'], answer: 0, topic: '\u521d\u7b49\u53d8\u6362' })
                ],
                probability: [
                    i => ({ type: 'choice', question: '\u4ece ' + ((i % 5) + 2) + ' \u4e2a\u7b49\u53ef\u80fd\u7ed3\u679c\u4e2d\u53d6 ' + ((i % 4) + 1) + ' \u4e2a\u4e8b\u4ef6\u7684\u6982\u7387', options: [((i % 4) + 1) + '/' + ((i % 5) + 2), '1/2', '0', '1'], answer: 0, topic: '\u53e4\u5178\u6982\u578b' }),
                    i => ({ type: 'fill', question: '\u82e5 X \\sim B(' + ((i % 8) + 2) + ', 1/2), \u6c42 E(X)', answer: String(((i % 8) + 2) / 2), topic: '\u4e8c\u9879\u5206\u5e03' }),
                    i => ({ type: 'choice', question: '\u4e92\u65a5\u4e8b\u4ef6 A,B \u6ee1\u8db3\u4ec0\u4e48\u6027\u8d28?', options: ['P(AB)=0', 'P(A)=P(B)', 'A=B', '\u72ec\u7acb\u5fc5\u4e92\u65a5'], answer: 0, topic: '\u4e8b\u4ef6\u5173\u7cfb' }),
                    i => ({ type: 'fill', question: '\u82e5 X \\sim P(' + ((i % 6) + 1) + '), \u6c42 D(X)', answer: String((i % 6) + 1), topic: '\u6cca\u677e\u5206\u5e03' }),
                    i => ({ type: 'choice', question: '\u82e5 X \\sim N(0,' + ((i % 5) + 1) + '), E(X) \u7b49\u4e8e', options: ['0', String((i % 5) + 1), '1', '-1'], answer: 0, topic: '\u6b63\u6001\u5206\u5e03' }),
                    i => ({ type: 'fill', question: '\u4e8b\u4ef6 A \u7684\u6982\u7387\u4e3a ' + ((i % 5) + 1) + '/10, \u5219 P(A^c)=', answer: String(1 - ((i % 5) + 1) / 10), topic: '\u5bf9\u7acb\u4e8b\u4ef6' }),
                    i => ({ type: 'choice', question: '\u72ec\u7acb\u4e8b\u4ef6 A,B \u6ee1\u8db3 P(A)=1/2, P(B)=1/' + ((i % 4) + 2) + ', \u5219 P(AB)=', options: ['1/' + (((i % 4) + 2) * 2), '1/2', '0', '1'], answer: 0, topic: '\u72ec\u7acb\u4e8b\u4ef6' }),
                    i => ({ type: 'fill', question: '\u6837\u672c\u5747\u503c\u7684\u671f\u671b\u7b49\u4e8e\u603b\u4f53\u5747\u503c ' + ((i % 5) + 1) + ' \u65f6\u4e3a', answer: String((i % 5) + 1), topic: '\u6837\u672c\u5747\u503c' }),
                    i => ({ type: 'choice', question: '\u65b9\u5dee D(aX+b) \u7b49\u4e8e', options: ['a^2D(X)', 'aD(X)+b', 'D(X)+b', 'aD(X)'], answer: 0, topic: '\u65b9\u5dee\u6027\u8d28' }),
                    i => ({ type: 'fill', question: '\u82e5 E(X)=' + ((i % 6) + 1) + ', E(Y)=' + ((i % 5) + 2) + ', \u5219 E(X+Y)=', answer: String(((i % 6) + 1) + ((i % 5) + 2)), topic: '\u671f\u671b\u6027\u8d28' }),
                    i => ({ type: 'choice', question: '\u53c2\u6570\u4f30\u8ba1\u4e2d\u6837\u672c\u65b9\u5dee\u5e38\u7528\u4e8e\u4f30\u8ba1', options: ['\u603b\u4f53\u65b9\u5dee', '\u603b\u4f53\u5747\u503c', '\u5206\u4f4d\u6570', '\u6982\u7387\u503c'], answer: 0, topic: '\u53c2\u6570\u4f30\u8ba1' })
                ]
            };
            const makers = templates[subject] || templates.calculus;
            for (let i = 0; out.length < need && i < need * 12; i++) {
                const item = makers[i % makers.length](i);
                const source = sources[Math.floor(i / makers.length) % sources.length];
                const topic = item.topic || (item.type === 'choice' ? '\u7efc\u5408\u5224\u65ad' : '\u8ba1\u7b97\u586b\u7a7a');
                const q = {
                    id: subject + '-fallback-' + i,
                    subject,
                    difficulty: Math.max(1, Math.min(10, 2 + (i % 8))),
                    type: item.type,
                    question: item.question + ' \u00B7 ' + source,
                    options: item.options,
                    answer: item.answer,
                    explanation: item.explanation || topic + '\u7684\u57fa\u672c\u9898\u578b\u7ec3\u4e60\u3002',
                    meta: { type: topic, knowledge_path: [subjectTitle, topic], keywords: [topic], source }
                };
                const key = normalizeStem(q.question);
                if (seen.has(key)) continue;
                seen.add(key);
                out.push(q);
            }
            return out;
        }

        const $ = id => document.getElementById(id);
        const $$ = selector => Array.from(document.querySelectorAll(selector));
        const API_ORIGIN = 'http://127.0.0.1:3001';
        const isLocalFile = location.protocol === 'file:';
        function apiUrl(path) {
            return isLocalFile ? `${API_ORIGIN}${path}` : path;
        }
        const storageKey = 'focusmath-state-v3';
        const authStorageKey = 'focusmath-auth-v1';
        const clientIdKey = 'focusmath-client-id-v1';
        let currentBankQuestion = null;
        let currentFavQuestion = null;

        function clientId() {
            let id = localStorage.getItem(clientIdKey);
            if (!id) {
                id = (crypto.randomUUID?.() || `fm-${Date.now()}-${Math.random().toString(16).slice(2)}`);
                localStorage.setItem(clientIdKey, id);
            }
            return id;
        }

        function trackEvent(type, payload = {}) {
            fetch(apiUrl('/api/event'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    clientId: clientId(),
                    at: new Date().toISOString(),
                    payload
                })
            }).catch(() => {});
        }

        function escapeHtml(value) {
            return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
        }

        function htmlWithMath(value) {
            const text = String(value ?? '');
            const parts = [];
            let last = 0;
            const re = /(?:\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+\$|\\(?:frac|sqrt|sum|int|lim|sin|cos|tan|cot|sec|csc|ln|log|exp|pi|alpha|beta|gamma|delta|theta|lambda|mu|sigma|phi|omega|le|ge|neq|times|div|cdot|infty|left|right|overline|hat|bar|vec)\b(?:\s*(?:\{[^{}]*\}|\([^()]*\)|\[[^\[\]]*\]|[A-Za-z0-9_+\-*/^=<>.,]+))*|[A-Za-z]\s*(?:_\{?[^{}\s]+\}?|\^\{?[^{}\s]+\}?)+(?:\s*[=<>≤≥]\s*[\\A-Za-z0-9_+\-*/^{}.()]+)?|(?:[A-Za-z0-9)\]}]+)\s*[=<>≤≥]\s*(?:\\?[A-Za-z]+|\d|[({\[])[\\A-Za-z0-9_+\-*/^{}.()[\]\s≤≥]*)/g;
            text.replace(re, (match, offset) => {
                if (offset > last) parts.push(escapeHtml(text.slice(last, offset)));
                if (/^(?:\$\$|\\\[|\\\(|\$)/.test(match)) parts.push(match);
                else parts.push(`\\(${normalizeVisibleMath(match.trim())}\\)`);
                last = offset + match.length;
                return match;
            });
            if (last < text.length) parts.push(escapeHtml(text.slice(last)));
            return parts.join('');
        }

        function normalizeVisibleMath(value) {
            return String(value ?? '')
                .replace(/\\leq?/g, '\\le')
                .replace(/\\geq?/g, '\\ge')
                .replace(/≤/g, ' \\le ')
                .replace(/≥/g, ' \\ge ')
                .replace(/×|\\times/g, '\\times ')
                .replace(/÷|\\div/g, '\\div ');
        }

        function normalizeVisibleMathSafe(value) {
            return String(value ?? '')
                .replace(/\\leq/g, '\\le')
                .replace(/\\geq/g, '\\ge')
                .replace(/[≤≦]/g, ' \\le ')
                .replace(/[≥≧]/g, ' \\ge ')
                .replace(/×/g, '\\times ')
                .replace(/÷/g, '\\div ');
        }

        function htmlWithMathSafe(value) {
            const text = String(value ?? '');
            const parts = [];
            let last = 0;
            const re = /(?:\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+\$|\\int(?:_\{?[^{}\s]+\}?|_\S+)?(?:\^\{?[^{}\s]+\}?|\^\S+)?(?:\s*(?:\\[,;! ]|\\[A-Za-z]+|[A-Za-z0-9{}_^+\-*/().,=<>]+))*|\\sum(?:_\{?[^{}\s]+\}?|_\S+)?(?:\^\{?[^{}\s]+\}?|\^\S+)?(?:\s*(?:\\[,;! ]|\\[A-Za-z]+|[A-Za-z0-9{}_^+\-*/().,=<>]+))*|\b[A-Za-z]\s*\\sim\s*[A-Za-z]+(?:\([^)]*\))?|\b[A-Za-z]\s*\\prime(?:\s*[=<>≤≥]\s*[\\A-Za-z0-9_+\-*/^{}.()[\]\s≤≥]+)?|\b[A-Z]\([A-Za-z]\)|\\(?:frac|sqrt|lim|sin|cos|tan|cot|sec|csc|ln|log|exp|pi|alpha|beta|gamma|delta|theta|lambda|mu|sigma|phi|omega|leq?|geq?|neq|times|div|cdot|infty|left|right|overline|hat|bar|vec|sim|prime|[,;!])(?:\s*(?:\{[^{}]*\}|\([^()]*\)|\[[^\[\]]*\]|[A-Za-z0-9_+\-*/^=<>.,]+))*|[A-Za-z]\s*(?:_\{?[^{}\s]+\}?|\^\{?[^{}\s]+\}?)+(?:\s*[=<>≤≥]\s*[\\A-Za-z0-9_+\-*/^{}.()]+)?|(?:[A-Za-z0-9)\]}]+)\s*[=<>≤≥]\s*(?:\\?[A-Za-z]+|\d|[({\[])[\\A-Za-z0-9_+\-*/^{}.()[\]\s≤≥]*)/g;
            text.replace(re, (match, offset) => {
                if (offset > last) parts.push(escapeHtml(text.slice(last, offset)));
                if (/^(?:\$\$|\\\[|\\\(|\$)/.test(match)) parts.push(match);
                else parts.push(`\\(${normalizeVisibleMathSafe(match.trim())}\\)`);
                last = offset + match.length;
                return match;
            });
            if (last < text.length) parts.push(escapeHtml(text.slice(last)));
            return parts.join('');
        }

        const htmlWithMathBase = htmlWithMathSafe;
        function wrapBareLatexMath(value) {
            return String(value ?? '').replace(/(^|[\s，。；：、,;:])((?:\\(?:iint|iiint|oint|int|sum|lim)(?:_\{?[^{}\s]+\}?|_\S+)?(?:\^\{?[^{}\s]+\}?|\^\S+)?(?:\s*(?:\\[,;! ]|\\[A-Za-z]+|[A-Za-z0-9{}_^+\-*/().,=<>]+)){0,12}))/g, (full, prefix, expr) => {
                if (!expr || /^(?:\\\(|\\\[|\$)/.test(expr)) return full;
                return `${prefix}\\(${normalizeVisibleMathSafe(expr.trim())}\\)`;
            });
        }
        htmlWithMath = value => htmlWithMathBase(wrapBareLatexMath(value));
        normalizeVisibleMath = normalizeVisibleMathSafe;

        function answerDisplayHtml(q) {
            if (q.type === 'choice') {
                const index = Number(q.answer);
                const label = String.fromCharCode(65 + index);
                return `${label}. ${htmlWithMath(q.options?.[index] || '')}`;
            }
            const raw = normalizeVisibleMath(q.answer || '');
            return needsKatex(raw) ? `\\(${raw}\\)` : htmlWithMath(raw);
        }

        const leadingQuestionTags = ['教材例题改写', '考研真题变式', '模拟卷迁移', '课后习题变形', '易错点复盘', '综合复盘', '综合小题', '概念辨析', '计算训练', '章节诊断', '公式迁移', '公式应用', '题型归纳', '考研真题', '模拟卷', '教材例题', '课后习题', '易错点'];
        function stripLeadingSubjectPrefix(text) {
            return String(text ?? '').trim().replace(/^(?:高等数学|线性代数|概率统计|calculus|linear|probability)\s*[·・•\u00B7、.。:：\-\u2014\u2013_]+\s*/i, '');
        }
        function moveLeadingQuestionTag(text) {
            let s = stripLeadingSubjectPrefix(text).replace(/^[\s\u00B7\u2022\u30FB\u3001.\u3002:\uFF1A\-\u2014\u2013_]*(?:\u7B2C?\s*\d+\s*[\u9898\u3001.\u3002:\uFF1A\-\u2014\u2013_\u00B7]*)?/u, '');
            for (const tag of leadingQuestionTags) {
                const re = new RegExp('^[\\s\\u00B7\\u2022\\u30FB\\u3001.\\u3002:\\uFF1A\\-\\u2014\\u2013_\\d]*(?:\\u7B2C?\\s*\\d+\\s*[\\u9898\\u3001.\\u3002:\\uFF1A\\-\\u2014\\u2013_\\u00B7]*)?(' + tag + ')(?:\\s*\\d+)?(?:\\u8BAD\\u7EC3|\\u771F\\u9898|\\u6A21\\u62DF|\\u8003\\u7814\\u771F\\u9898|\\u4F8B\\u9898|\\u4E60\\u9898|\\u7EFC\\u5408)?[\\u3001:\\uFF1A\\.\\u3002\\s\\-\\u2014\\u2013_]+(.+)$');
                const match = s.match(re);
                if (match && !match[2].endsWith(match[1])) {
                    const body = match[2].trim().replace(/^[\s·•・、.。:：\-—–_\d]+/u, '').replace(/[。.\s·•・、]+$/, '');
                    return `${body} · ${match[1]}`;
                }
            }
            return s;
        }

        function questionDisplayText(qOrText, limit = 0) {
            const raw = typeof qOrText === 'string' ? qOrText : (qOrText?.question || '');
            const text = moveLeadingQuestionTag(String(raw || ''));
            if (!limit || text.length <= limit) return text;
            if (/[\\$]|[_^{}]/.test(text)) return text;
            return `${text.slice(0, limit).trim()}...`;
        }

        function questionHtml(qOrText, limit = 0) {
            return htmlWithMath(questionDisplayText(qOrText, limit));
        }

        function renderLatex(root = document.body) {
            if (window.renderMathInElement) {
                renderMathInElement(root, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true }
                    ],
                    throwOnError: false
                });
            } else if (!root.dataset?.latexRetryQueued) {
                if (root.dataset) root.dataset.latexRetryQueued = '1';
                setTimeout(() => {
                    if (root.dataset) delete root.dataset.latexRetryQueued;
                    if (window.renderMathInElement) renderLatex(root);
                }, 350);
            }
        }

        function stripLatexDelimiters(text) {
            return String(text)
                .replace(/^\\?\[\s*/, '')
                .replace(/\s*\\?\]$/m, '')
                .replace(/^\\?\(\s*/, '')
                .replace(/\s*\\?\)$/m, '');
        }

        function needsKatex(text) {
            return /(?:\\[A-Za-z]+|[\^_{}]|[<>=≤≥≠≈×÷]|(?:\d+|[A-Za-z])\s*\/\s*(?:\d+|[A-Za-z]))/.test(String(text));
        }

        function displayLatexExpression(value) {
            let s = normalizeVisibleMath(String(value ?? '').trim());
            if (!s) return '';
            s = s.replace(/(^|[=(+\-*/,\s])(-?(?:\d+(?:\.\d+)?|[A-Za-z]+|\([^()]+\)))\s*\/\s*(-?(?:\d+(?:\.\d+)?|[A-Za-z]+|\([^()]+\)))/g, (m, lead, a, b) => `${lead}\\frac{${a}}{${b}}`);
            return s;
        }

        function updateFillPreview() {
            const input = $('fillInput');
            const preview = $('fillPreview');
            if (!input || !preview) return;
            const raw = input.value;
            if (!raw.trim()) {
                preview.innerHTML = '';
                return;
            }
            const display = displayLatexExpression(raw);
            if (window.katex && needsKatex(display)) {
                try { katex.render(display, preview, { throwOnError: false }); }
                catch (e) { preview.textContent = raw; }
            } else {
                preview.textContent = raw;
            }
        }

        // Serializable slice of the runtime state. Everything here is persisted
        // to the IndexedDB `state` store (and used as a localStorage fallback).
        function collectState() {
            return {
                totalAnswered: state.totalAnswered,
                totalCorrect: state.totalCorrect,
                defaultAnswered: state.defaultAnswered,
                defaultCorrect: state.defaultCorrect,
                allModeStats: state.allModeStats,
                perSubject: state.perSubject,
                allSubjectStats: state.allSubjectStats,
                topicStats: state.topicStats,
                answeredQuestionKeys: state.answeredQuestionKeys,
                correctQuestionKeys: state.correctQuestionKeys,
                questionAttemptCounts: state.questionAttemptCounts,
                questionLastCorrect: state.questionLastCorrect,
                questionAccuracyScores: state.questionAccuracyScores,
                recentPractice: state.recentPractice,
                sessionHistory: state.sessionHistory,
                levels: state.levels,
                favorites: state.favorites,
                customQuestions: state.customQuestions,
                achievementFlags: state.achievementFlags,
                focusBestSeconds: state.focusBestSeconds,
                customSubjects: state.customSubjects,
                sessionLength: state.sessionLength,
                adaptiveLength: state.adaptiveLength,
                customLength: state.customLength,
                streak: state.streak,
                auth: state.auth
            };
        }

        // Defensive normalization so missing/partial saved data never breaks UI.
        function normalizeState() {
            state.perSubject = {
                calculus: { answered: 0, correct: 0, levelSum: 0, bestStreak: 0, currentStreak: 0, ...(state.perSubject?.calculus || {}) },
                linear: { answered: 0, correct: 0, levelSum: 0, bestStreak: 0, currentStreak: 0, ...(state.perSubject?.linear || {}) },
                probability: { answered: 0, correct: 0, levelSum: 0, bestStreak: 0, currentStreak: 0, ...(state.perSubject?.probability || {}) }
            };
            state.allModeStats = { answered: 0, correct: 0, levelSum: 0, ...(state.allModeStats || {}) };
            state.allSubjectStats = {
                calculus: { answered: 0, correct: 0, levelSum: 0, ...(state.allSubjectStats?.calculus || {}) },
                linear: { answered: 0, correct: 0, levelSum: 0, ...(state.allSubjectStats?.linear || {}) },
                probability: { answered: 0, correct: 0, levelSum: 0, ...(state.allSubjectStats?.probability || {}) }
            };
            state.topicStats = state.topicStats && typeof state.topicStats === 'object' ? state.topicStats : {};
            state.answeredQuestionKeys = state.answeredQuestionKeys && typeof state.answeredQuestionKeys === 'object' ? state.answeredQuestionKeys : {};
            state.correctQuestionKeys = state.correctQuestionKeys && typeof state.correctQuestionKeys === 'object' ? state.correctQuestionKeys : {};
            state.questionAttemptCounts = state.questionAttemptCounts && typeof state.questionAttemptCounts === 'object' ? state.questionAttemptCounts : {};
            state.questionLastCorrect = state.questionLastCorrect && typeof state.questionLastCorrect === 'object' ? state.questionLastCorrect : {};
            state.questionAccuracyScores = state.questionAccuracyScores && typeof state.questionAccuracyScores === 'object' ? state.questionAccuracyScores : {};
            Object.keys(state.answeredQuestionKeys).forEach(key => {
                if (state.answeredQuestionKeys[key] && !Number(state.questionAttemptCounts[key])) state.questionAttemptCounts[key] = 1;
                if (state.questionAccuracyScores[key] === undefined) {
                    state.questionAccuracyScores[key] = state.questionLastCorrect?.[key] === true ? 50 : 0;
                }
            });
            state.recentPractice = Array.isArray(state.recentPractice) ? state.recentPractice : [];
            state.sessionHistory = Array.isArray(state.sessionHistory) ? state.sessionHistory : [];
            state.levels = { calculus: 1, linear: 1, probability: 1, ...(state.levels || {}) };
            state.sessionLength = Math.max(5, Math.floor(Number(state.sessionLength || 5)));
            state.adaptiveLength = Math.max(5, Math.floor(Number(state.adaptiveLength || state.sessionLength || 5)));
            state.customLength = state.customLength == null ? null : Math.max(5, Math.floor(Number(state.customLength || 5)));
            state.favorites = Array.isArray(state.favorites) ? state.favorites : [];
            state.customQuestions = Array.isArray(state.customQuestions) ? state.customQuestions : [];
            state.achievementFlags = state.achievementFlags && typeof state.achievementFlags === 'object' ? state.achievementFlags : {};
            state.focusBestSeconds = Math.max(0, Number(state.focusBestSeconds || 0));
            state.customSubjects = Array.isArray(state.customSubjects) && state.customSubjects.length ? state.customSubjects : ['calculus'];
            if (state.customQuestions.length) state.achievementFlags.firstImport = true;
            if ((state.sessionHistory || []).some(item => Number(item.total || 0) >= 20)) state.achievementFlags.longSession20 = true;
            if ((state.sessionHistory || []).some(item => Number(item.timerMinutes || 0) > 0)) state.achievementFlags.timerSession = true;
            if ((state.sessionHistory || []).some(item => (item.questions || []).some(q => Number(q.difficulty || 0) >= 10))) state.achievementFlags.difficulty10 = true;
            state.auth = {
                token: state.auth?.token || null,
                emailHint: state.auth?.emailHint || null,
                isLoggedIn: !!(state.auth?.isLoggedIn && state.auth?.token),
                cloudSaves: Array.isArray(state.auth?.cloudSaves) ? state.auth.cloudSaves : []
            };
            state.bankDeleteSelected = Array.isArray(state.bankDeleteSelected) ? state.bankDeleteSelected : [];
            state.bankDeleteMode = !!state.bankDeleteMode;
            if (!Array.isArray(state.bankTopicFilters)) {
                state.bankTopicFilters = state.bankTopicFilter && state.bankTopicFilter !== 'all' ? [state.bankTopicFilter] : [];
            }
        }

        // ===========================================
        // IndexedDB layer: the single source of truth
        // for the question bank and all user data.
        // ===========================================
        const fmDB = {
            name: 'focusmath-db',
            version: 1,
            db: null,
            available: false,
            open() {
                return new Promise(resolve => {
                    if (!('indexedDB' in window)) { this.available = false; return resolve(false); }
                    try {
                        const req = indexedDB.open(this.name, this.version);
                        req.onupgradeneeded = () => {
                            const db = req.result;
                            if (!db.objectStoreNames.contains('questions')) {
                                db.createObjectStore('questions', { keyPath: 'key' });
                            }
                            if (!db.objectStoreNames.contains('kv')) {
                                db.createObjectStore('kv', { keyPath: 'key' });
                            }
                        };
                        req.onsuccess = () => { this.db = req.result; this.available = true; resolve(true); };
                        req.onerror = () => { this.available = false; resolve(false); };
                    } catch (e) { this.available = false; resolve(false); }
                });
            },
            _tx(store, mode) { return this.db.transaction(store, mode).objectStore(store); },
            putQuestions(items) {
                return new Promise(resolve => {
                    if (!this.available) return resolve(false);
                    const tx = this.db.transaction('questions', 'readwrite');
                    const store = tx.objectStore('questions');
                    store.clear();
                    items.forEach(item => store.put(item));
                    tx.oncomplete = () => resolve(true);
                    tx.onerror = () => resolve(false);
                });
            },
            getAllQuestions() {
                return new Promise(resolve => {
                    if (!this.available) return resolve([]);
                    const req = this._tx('questions', 'readonly').getAll();
                    req.onsuccess = () => resolve(req.result || []);
                    req.onerror = () => resolve([]);
                });
            },
            putKV(key, value) {
                return new Promise(resolve => {
                    if (!this.available) return resolve(false);
                    const req = this._tx('kv', 'readwrite').put({ key, value });
                    req.onsuccess = () => resolve(true);
                    req.onerror = () => resolve(false);
                });
            },
            getKV(key) {
                return new Promise(resolve => {
                    if (!this.available) return resolve(null);
                    const req = this._tx('kv', 'readonly').get(key);
                    req.onsuccess = () => resolve(req.result ? req.result.value : null);
                    req.onerror = () => resolve(null);
                });
            }
        };

        const SEED_VERSION = 'seed-v6-latex-count';
        const MIN_LOCAL_SUBJECT_QUESTIONS = 100;

        // Build the canonical question set for one subject from the static bank
        // plus the procedural generator, deduped (similarity <= 80%) and balanced
        // to choice:fill >= 3:2. Used to seed the database.
        function buildSubjectQuestions(subject) {
            const base = uniqueQuestionList(questionDB[subject] || []).map(q => ({ ...q, subject, question: stripLeadingSubjectPrefix(q.question) }));
            const generated = generateSubjectQuestions(subject);
            const merged = similarQuestionList(uniqueQuestionList([...base, ...generated]), 0.8, 1000);
            return balanceChoiceFill(merged);
        }

        function ensureLocalQuestionBankReady(minCount = MIN_LOCAL_SUBJECT_QUESTIONS) {
            if (subjectKeys().every(subject => (questionDB[subject] || []).length >= minCount)) return;
            subjectKeys().forEach(subject => {
                if ((questionDB[subject] || []).length < minCount) {
                    questionDB[subject] = buildSubjectQuestions(subject);
                }
            });
        }

        async function initDatabase() {
            const ok = await fmDB.open();
            if (!ok) {
                // Fallback: regenerate in memory and load state from localStorage.
                subjectKeys().forEach(subject => {
                    questionDB[subject] = buildSubjectQuestions(subject);
                });
                databaseReady = true;
                loadData();
                return;
            }
            const storedSeed = await fmDB.getKV('seedVersion');
            if (!Object.values(questionDB).some(list => Array.isArray(list) && list.length)) {
                subjectKeys().forEach(subject => {
                    questionDB[subject] = buildSubjectQuestions(subject);
                });
            }
            const existingRows = await fmDB.getAllQuestions();
            if (Object.values(questionDB).some(list => Array.isArray(list) && list.length) && (storedSeed !== `${SEED_VERSION}:${questionBankSeed}` || !existingRows.length)) {
                const all = [];
                subjectKeys().forEach(subject => {
                    buildSubjectQuestions(subject).forEach(q => all.push({ ...q, key: `${subject}::${q.id}` }));
                });
                await fmDB.putQuestions(all);
                await fmDB.putKV('seedVersion', `${SEED_VERSION}:${questionBankSeed}`);
            }
            // Hydrate the in-memory question bank from the database.
            if (Object.values(questionDB).some(list => Array.isArray(list) && list.length)) {
                const rows = await fmDB.getAllQuestions();
                subjectKeys().forEach(subject => {
                    questionDB[subject] = rows.filter(q => q.subject === subject).map(({ key, ...q }) => q);
                });
            }
            ensureLocalQuestionBankReady();
            databaseReady = true;
            // Load user state from the database, falling back to localStorage for
            // a one-time migration of existing users.
            const savedState = await fmDB.getKV('state');
            if (savedState && typeof savedState === 'object') {
                Object.assign(state, savedState);
            } else {
                const legacy = JSON.parse(localStorage.getItem(storageKey) || '{}');
                if (Object.keys(legacy).length) {
                    Object.assign(state, legacy);
                    await fmDB.putKV('state', collectState());
                }
            }
            hydrateAuthFromLocalStorage();
            normalizeState();
            // Settings stay in localStorage so they apply synchronously on load.
            try { Object.assign(settings, JSON.parse(localStorage.getItem(settingsKey) || '{}')); } catch (e) {}
            settings.sound = { ...defaultSettings.sound, ...(settings.sound || {}) };
        }

        function saveData() {
            const payload = collectState();
            // Persist to IndexedDB (primary). Fire-and-forget; failures are non-fatal.
            if (fmDB.available) {
                fmDB.putKV('state', payload).catch(() => {});
            }
            // Keep a lightweight localStorage mirror so the app still works if
            // IndexedDB is unavailable, and for quick first-paint hydration.
            try {
                localStorage.setItem(storageKey, JSON.stringify(payload));
                localStorage.setItem(settingsKey, JSON.stringify(settings));
                localStorage.setItem(authStorageKey, JSON.stringify(state.auth || {}));
            } catch (error) {
                console.warn('Save failed', error);
            }
        }

        function loadData() {
        // Legacy synchronous loader used as a fallback when IndexedDB is
            // unavailable, and to read settings. The main path is initDatabase().
            try {
                const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
                Object.assign(state, saved);
                const auth = JSON.parse(localStorage.getItem(authStorageKey) || '{}');
                if (auth && typeof auth === 'object') state.auth = { ...(state.auth || {}), ...auth };
                normalizeState();
                Object.assign(settings, JSON.parse(localStorage.getItem(settingsKey) || '{}'));
                settings.sound = { ...defaultSettings.sound, ...(settings.sound || {}) };
            } catch (error) {
                console.warn('Load failed', error);
            }
        }

        function hydrateAuthFromLocalStorage() {
            try {
                const auth = JSON.parse(localStorage.getItem(authStorageKey) || '{}');
                if (auth && typeof auth === 'object') {
                    state.auth = { ...(state.auth || {}), ...auth };
                    normalizeState();
                }
            } catch (_) {}
        }

        function exportBundle() {
            return {
                _format: 'focusmath-export',
                _schemaVersion: 2,
                _exportedAt: new Date().toISOString(),
                _appVersion: 'focusmath-local',
                state: collectState(),
                settings: { ...settings, sound: { ...settings.sound } }
            };
        }

        function dataSummaryFromBundle(bundle) {
            const s = bundle?.state || {};
            return {
                answered: Number(s.totalAnswered || 0),
                correct: Number(s.totalCorrect || 0),
                favorites: Array.isArray(s.favorites) ? s.favorites.length : 0,
                sessions: Array.isArray(s.sessionHistory) ? s.sessionHistory.length : 0
            };
        }

        function formatDataSummary(summary) {
            return `已答 ${summary.answered || 0} 题，答对 ${summary.correct || 0} 题，收藏 ${summary.favorites || 0} 题，记录 ${summary.sessions || 0} 组`;
        }

        function validateExportBundle(bundle) {
            if (!bundle || typeof bundle !== 'object') throw new Error('文件内容不是有效 JSON 数据。');
            if (bundle._format !== 'focusmath-export') throw new Error('不是 FocusMath 导出的数据文件。');
            if (Number(bundle._schemaVersion || 0) > 2) throw new Error('文件版本较新，当前网页暂不支持导入。');
            if (!bundle.state || typeof bundle.state !== 'object') throw new Error('文件缺少 state 数据。');
            if (!bundle.settings || typeof bundle.settings !== 'object') throw new Error('文件缺少 settings 数据。');
            return bundle;
        }

        async function applyExportBundle(bundle) {
            validateExportBundle(bundle);
            Object.assign(state, bundle.state);
            Object.assign(settings, defaultSettings, bundle.settings || {});
            settings.sound = { ...defaultSettings.sound, ...(bundle.settings?.sound || settings.sound || {}) };
            normalizeState();
            if (fmDB.available) await fmDB.putKV('state', collectState());
            localStorage.setItem(storageKey, JSON.stringify(collectState()));
            localStorage.setItem(settingsKey, JSON.stringify(settings));
            localStorage.setItem(authStorageKey, JSON.stringify(state.auth || {}));
        }

        function exportLocalData() {
            const bundle = exportBundle();
            const stamp = new Date().toISOString().slice(0, 10);
            downloadText(`focusmath-data-${stamp}.json`, JSON.stringify(bundle, null, 2), 'application/json;charset=utf-8');
            const status = $('localDataStatus');
            if (status) status.textContent = '已导出当前浏览器数据。';
        }

        async function importLocalDataFile(file) {
            const status = $('localDataStatus');
            try {
                if (!file) return;
                const bundle = validateExportBundle(JSON.parse(await file.text()));
                const current = dataSummaryFromBundle(exportBundle());
                const incoming = dataSummaryFromBundle(bundle);
                const ok = confirm(`导入会覆盖当前浏览器数据，但不会清空题库缓存。\n\n当前：${formatDataSummary(current)}\n导入：${formatDataSummary(incoming)}\n\n确定继续吗？`);
                if (!ok) {
                    if (status) status.textContent = '已取消导入。';
                    return;
                }
                await applyExportBundle(bundle);
                if (status) status.textContent = '导入完成，正在刷新页面。';
                location.reload();
            } catch (error) {
                if (status) status.textContent = error.message || '导入失败，当前数据未被覆盖。';
            } finally {
                const input = $('localDataFileInput');
                if (input) input.value = '';
            }
        }

        function validEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
        }

        function renderDataGateway() {
            const gateway = $('dataGateway');
            if (!gateway) return;
            normalizeState();
            const loggedIn = !!(state.auth?.isLoggedIn && state.auth?.token);
            const hint = state.auth?.emailHint || '';
            $('dataGatewayState').textContent = loggedIn ? '云身份' : '本地';
            $('dataGatewayDesc').textContent = loggedIn ? `已绑定 ${hint}，可使用加密云存档。` : '本地模式，数据仅保存在此浏览器。';
            $('identityHint').textContent = loggedIn
                ? `当前身份：${hint}。更换邮箱会切换账号；云存档不会自动迁移。`
                : '可通过邮箱获取一次性登录链接。更换邮箱会切换到另一个身份。';
            const emailRow = $('magicEmailInput')?.parentElement;
            if (emailRow) emailRow.style.display = loggedIn ? 'none' : 'flex';
            const cloud = $('cloudSaveControls');
            if (cloud) cloud.style.display = loggedIn ? 'flex' : 'none';
            const actions = $('identityActions');
            if (actions) {
                actions.innerHTML = loggedIn
                    ? '<button type="button" id="refreshCloudSavesBtn"><span class="fm-icon download"></span>刷新云存档</button><button type="button" id="signOutIdentityBtn"><span class="fm-icon signout"></span>退出身份</button>'
                    : '';
                $('refreshCloudSavesBtn')?.addEventListener('click', listCloudSaves);
                $('signOutIdentityBtn')?.addEventListener('click', signOutIdentity);
            }
            renderCloudSaveList();
        }

        async function sendMagicLink() {
            const input = $('magicEmailInput');
            const status = $('identityStatus');
            const email = input?.value.trim() || '';
            if (!validEmail(email)) {
                if (status) status.textContent = '请输入合法邮箱地址。';
                return;
            }
            if (status) status.textContent = '正在发送登录链接...';
            try {
                const redirectBase = location.href.replace(/[?#].*$/, '');
                const res = await fetch(apiUrl('/api/auth/magic-link'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, redirectBase })
                });
                const data = await res.json();
                if (!data.ok) throw new Error(data.error || 'send failed');
                if (status) {
                    status.textContent = data.devMagicLink
                        ? `开发模式未配置 SMTP，登录链接已输出到后端控制台。当前也可复制：${data.devMagicLink}`
                        : '登录链接已发送，请检查邮箱。';
                }
            } catch (error) {
                if (status) status.textContent = '发送失败，请确认后端服务已启动。';
            }
        }

        async function handleMagicLogin() {
            const params = new URLSearchParams(location.search);
            const token = params.get('magic');
            if (!token) return;
            const status = $('identityStatus');
            if (status) status.textContent = '正在验证登录链接...';
            try {
                const res = await fetch(apiUrl('/api/auth/verify'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                const data = await res.json();
                if (!data.ok || !data.authToken) throw new Error(data.error || 'verify failed');
                state.auth = {
                    token: data.authToken,
                    emailHint: data.emailHint || '',
                    isLoggedIn: true,
                    cloudSaves: []
                };
                saveData();
                const clean = `${location.origin}${location.pathname}${location.hash || ''}`;
                if (location.protocol !== 'file:') history.replaceState(null, '', clean);
                renderDataGateway();
                await listCloudSaves();
                if (status) status.textContent = '身份已绑定。';
            } catch (error) {
                if (status) status.textContent = '登录链接无效或已过期。';
            }
        }

        function authHeaders(extra = {}) {
            return { ...extra, Authorization: `Bearer ${state.auth?.token || ''}` };
        }

        function signOutIdentity() {
            state.auth = { token: null, emailHint: null, isLoggedIn: false, cloudSaves: [] };
            saveData();
            renderDataGateway();
            const status = $('identityStatus');
            if (status) status.textContent = '已退出身份，本地数据保留。';
        }

        function bytesToBase64(bytes) {
            let binary = '';
            const chunk = 0x8000;
            for (let i = 0; i < bytes.length; i += chunk) {
                binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
            }
            return btoa(binary);
        }

        function base64ToBytes(text) {
            const binary = atob(text);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            return bytes;
        }

        async function sha256Hex(bytes) {
            const hash = await crypto.subtle.digest('SHA-256', bytes);
            return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
        }

        async function deriveCloudKey(password, salt) {
            const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
            return crypto.subtle.deriveKey(
                { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 200000 },
                material,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
        }

        async function encryptCloudBundle(bundle, password) {
            const plain = new TextEncoder().encode(JSON.stringify(bundle));
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const key = await deriveCloudKey(password, salt);
            const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
            return {
                schemaVersion: 2,
                kdf: 'PBKDF2-SHA256',
                iterations: 200000,
                salt: bytesToBase64(salt),
                iv: bytesToBase64(iv),
                ciphertext: bytesToBase64(cipher),
                plainHash: await sha256Hex(plain),
                createdAt: new Date().toISOString()
            };
        }

        async function decryptCloudBundle(pack, password) {
            const salt = base64ToBytes(pack.salt);
            const iv = base64ToBytes(pack.iv);
            const cipher = base64ToBytes(pack.ciphertext);
            const key = await deriveCloudKey(password, salt);
            const plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher));
            if (pack.plainHash && await sha256Hex(plain) !== pack.plainHash) throw new Error('hash mismatch');
            return validateExportBundle(JSON.parse(new TextDecoder().decode(plain)));
        }

        async function uploadCloudSave() {
            const status = $('identityStatus');
            if (!state.auth?.token) {
                if (status) status.textContent = '请先绑定邮箱身份。';
                return;
            }
            const password = prompt('设置此云存档的加密密码。忘记密码将无法恢复。');
            if (!password) return;
            try {
                if (status) status.textContent = '正在加密并上传云存档...';
                const bundle = exportBundle();
                const encrypted = await encryptCloudBundle(bundle, password);
                const saveName = ($('cloudSaveName')?.value || '').trim() || `FocusMath ${new Date().toLocaleString()}`;
                const res = await fetch(apiUrl('/api/save/upload'), {
                    method: 'POST',
                    headers: authHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({
                        saveName,
                        package: encrypted,
                        dataHash: encrypted.plainHash,
                        dataSummary: dataSummaryFromBundle(bundle)
                    })
                });
                const data = await res.json();
                if (!data.ok) throw new Error(data.error || 'upload failed');
                if (status) status.textContent = '云存档已上传。';
                await listCloudSaves();
            } catch (error) {
                if (status) status.textContent = '上传失败，请确认身份仍有效且后端服务已启动。';
            }
        }

        async function listCloudSaves() {
            if (!state.auth?.token) return;
            const status = $('identityStatus');
            try {
                const res = await fetch(apiUrl('/api/save/list'), { headers: authHeaders() });
                const data = await res.json();
                if (!data.ok) throw new Error(data.error || 'list failed');
                state.auth.cloudSaves = Array.isArray(data.saves) ? data.saves : [];
                saveData();
                renderCloudSaveList();
                if (status && !state.auth.cloudSaves.length) status.textContent = '暂无云存档。';
            } catch (error) {
                if (status) status.textContent = '云存档列表读取失败。';
            }
        }

        function renderCloudSaveList() {
            const list = $('cloudSaveList');
            if (!list) return;
            if (!state.auth?.isLoggedIn) {
                list.innerHTML = '';
                return;
            }
            const saves = Array.isArray(state.auth.cloudSaves) ? state.auth.cloudSaves : [];
            list.innerHTML = saves.map(save => `
                <div class="cloud-save-item">
                    <span>${escapeHtml(save.saveName || 'FocusMath')} · ${escapeHtml(String(save.createdAt || '').slice(0, 10))}</span>
                    <button type="button" data-cloud-download="${escapeHtml(save.id)}">下载</button>
                    <button type="button" data-cloud-delete="${escapeHtml(save.id)}">删除</button>
                </div>
            `).join('');
            list.querySelectorAll('[data-cloud-download]').forEach(btn => btn.addEventListener('click', () => downloadCloudSave(btn.dataset.cloudDownload)));
            list.querySelectorAll('[data-cloud-delete]').forEach(btn => btn.addEventListener('click', () => deleteCloudSave(btn.dataset.cloudDelete)));
        }

        async function downloadCloudSave(id) {
            const status = $('identityStatus');
            const password = prompt('输入此云存档的加密密码。');
            if (!password) return;
            try {
                const res = await fetch(apiUrl(`/api/save/download?id=${encodeURIComponent(id)}`), { headers: authHeaders() });
                const data = await res.json();
                if (!data.ok || !data.package) throw new Error(data.error || 'download failed');
                const bundle = await decryptCloudBundle(data.package, password);
                const current = dataSummaryFromBundle(exportBundle());
                const incoming = dataSummaryFromBundle(bundle);
                const ok = confirm(`下载的云存档会覆盖当前浏览器数据。\n\n当前：${formatDataSummary(current)}\n云存档：${formatDataSummary(incoming)}\n\n确定继续吗？`);
                if (!ok) return;
                await applyExportBundle(bundle);
                if (status) status.textContent = '云存档已恢复，正在刷新页面。';
                location.reload();
            } catch (error) {
                if (status) status.textContent = '下载或解密失败，请检查密码。';
            }
        }

        async function deleteCloudSave(id) {
            const status = $('identityStatus');
            if (!confirm('确定删除这个云存档吗？')) return;
            try {
                const res = await fetch(apiUrl('/api/save/delete'), {
                    method: 'POST',
                    headers: authHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ id })
                });
                const data = await res.json();
                if (!data.ok) throw new Error(data.error || 'delete failed');
                if (status) status.textContent = '云存档已删除。';
                await listCloudSaves();
            } catch (error) {
                if (status) status.textContent = '删除云存档失败。';
            }
        }

        async function refreshQuestionBankFromBackend({ render = false, force = false } = {}) {
            const cached = readQuestionBankCache(true);
            if (cached) {
                applyQuestionBankData(cached, { expandGenerated: true });
                if (render) renderBank();
            }
            if (!force && Date.now() - questionBankLastBackendRefresh < questionBankBackendRefreshMs && cached) return cached;
            questionBankLastBackendRefresh = Date.now();
            await loadQuestionBank({ force: true, expandGenerated: true, useCache: false });
            await loadQuestionIndex({ force: true });
            if (render) renderBank();
        }

        // Task 5: 动态面包屑 - 按真实访问路径记录，同页连续出现自动压缩
        // state.crumbStack 是屏幕 ID 数组，初始为 ['homeScreen']
        function pushCrumb(screenId) {
            if (!screenId || !SCREEN_LABELS[screenId]) return;
            // 主页回到根，重置
            if (screenId === 'homeScreen') {
                state.crumbStack = ['homeScreen'];
                return;
            }
            const stack = state.crumbStack;
            // 同页连续压缩：栈顶已是该 screen，不重复 push
            if (stack[stack.length - 1] === screenId) return;
            // 若该 screen 已在栈中其他位置：截断到该位置（弹出其后的所有项）
            // 这样同一条路径中每个 screen 最多出现一次
            const existingIdx = stack.lastIndexOf(screenId);
            if (existingIdx !== -1) {
                state.crumbStack = stack.slice(0, existingIdx + 1);
                return;
            }
            stack.push(screenId);
        }
        function truncateCrumbTo(screenId) {
            // 用户点击面包屑中段：截断到该项位置
            const idx = state.crumbStack.lastIndexOf(screenId);
            if (idx === -1) return;
            state.crumbStack = state.crumbStack.slice(0, idx + 1);
        }

        function updateBreadcrumbs(activeId) {
            const nav = $('breadcrumbs');
            if (!nav) return;
            // Task 5: 从动态栈读取真实路径
            const items = state.crumbStack.slice();
            nav.innerHTML = '';
            if (!items.length || state.focusMode) return;
            items.forEach((screenId, index) => {
                if (index) {
                    const sep = document.createElement('span');
                    sep.className = 'sep';
                    sep.textContent = '/';
                    nav.appendChild(sep);
                }
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = SCREEN_LABELS[screenId] || screenId;
                btn.disabled = screenId === activeId;
                btn.addEventListener('click', () => {
                    if (state.focusMode || document.body.classList.contains('focus-active')) return;
                    if (screenId === 'quizScreen') return;
                    if (screenId === 'homeScreen' && document.body.classList.contains('quiz-active')) {
                        returnHomeFromQuiz();
                        return;
                    }
                    // Task 5: 截断到点击位置（清除其后的历史）
                    if (screenId !== activeId) truncateCrumbTo(screenId);
                    showScreen(screenId);
                });
                nav.appendChild(btn);
            });
        }

        function showScreen(id) {
            $$('.screen').forEach(screen => screen.classList.remove('active'));
            $(id).classList.add('active');
            document.body.classList.toggle('quiz-active', id === 'quizScreen');
            document.body.classList.toggle('wide-view', id === 'bankScreen' || id === 'favoritesScreen' || id === 'radarScreen');

            if (id === 'quizScreen') {
                if (settings.sound.enabled) startSound();
            } else {
                setFocusMode(false);
                // 离开答题界面时关闭教练面板并停止计时
                if (typeof closeCoachPanel === 'function') closeCoachPanel();
                if (typeof stopCoachTimer === 'function') stopCoachTimer();
            }
            // Task 5: 记录真实访问路径（含同页连续压缩）
            pushCrumb(id);
            updateBreadcrumbs(id);
            if (id === 'bankScreen') {
                bankRemoteError = '';
                renderBank();
                const key = bankRemoteKey(state.bankPage);
                if (!bankRemotePageCache.has(key) && bankRemoteLoadingKey !== key) {
                    loadBankRemotePages(state.bankPage, { render: true, force: true });
                }
            }
            if (id === 'favoritesScreen') renderFavorites();
            if (id === 'statsScreen') renderStatsScreen();
            if (id === 'radarScreen') renderRadar();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function returnHomeFromQuiz() {
            const inQuiz = document.body.classList.contains('quiz-active') && state.sessionQuestions.length;
            const unfinished = state.currentQuestionIndex < state.sessionQuestions.length;
            if (settings.homeConfirm !== false && inQuiz && unfinished && !confirm('\u6b63\u5728\u7b54\u9898\u4e2d\uff0c\u786e\u5b9a\u8fd4\u56de\u9996\u9875\u5417\uff1f')) return;
            showScreen('homeScreen');
        }

        // ESC 面包屑回退：根据当前页面的面包屑路径退回上一级
        function navigateBackByBreadcrumb() {
            if (state.focusMode || document.body.classList.contains('focus-active')) return false;
            const activeScreen = document.querySelector('.screen.active')?.id;
            if (!activeScreen || activeScreen === 'homeScreen') return false;
            // Task 5: 从动态栈读取真实路径
            const stack = state.crumbStack;
            const currentIndex = stack.lastIndexOf(activeScreen);
            if (currentIndex <= 0) return false;
            const parentScreenId = stack[currentIndex - 1];
            // 答题中返回上一级需要确认
            if (activeScreen === 'quizScreen') {
                const unfinished = state.sessionQuestions.length && state.currentQuestionIndex < state.sessionQuestions.length;
                if (settings.homeConfirm !== false && unfinished && !confirm('\u6b63\u5728\u7b54\u9898\u4e2d\uff0c\u786e\u5b9a\u8fd4\u56de\u4e0a\u4e00\u7ea7\u5417\uff1f')) return true;
            }
            // Task 5: 弹出当前项，回退到上一级
            state.crumbStack = stack.slice(0, currentIndex);
            showScreen(parentScreenId);
            return true;
        }

        function bringFloatingLayerToFront(layer) {
            const root = document.documentElement.style;
            root.setProperty('--app-z', layer === 'answer' ? '160' : '1');
            root.setProperty('--answer-z', layer === 'answer' ? '160' : '100');
            root.setProperty('--whiteboard-z', layer === 'whiteboard' ? '160' : '120');
            root.setProperty('--calc-z', layer === 'calc' ? '160' : '110');
        }

        function ensureSummaryReturnButtons() {
            const actions = $('homeBtn')?.parentElement;
            if (!actions || $('returnBankBtn')) return;
            const bankBtn = document.createElement('button');
            bankBtn.className = 'secondary';
            bankBtn.id = 'returnBankBtn';
            bankBtn.textContent = '返回题库';
            bankBtn.style.display = 'none';
            const favBtn = document.createElement('button');
            favBtn.className = 'secondary';
            favBtn.id = 'returnFavBtn';
            favBtn.textContent = '返回收藏夹';
            favBtn.style.display = 'none';
            actions.insertBefore(bankBtn, $('homeBtn'));
            actions.insertBefore(favBtn, $('homeBtn'));
            bankBtn.addEventListener('click', () => showScreen('bankScreen'));
            favBtn.addEventListener('click', () => showScreen('favoritesScreen'));
        }

        function updateSummaryReturnButtons() {
            ensureSummaryReturnButtons();
            if ($('returnBankBtn')) $('returnBankBtn').style.display = state.quizSource === 'bank' ? 'inline-flex' : 'none';
            if ($('returnFavBtn')) $('returnFavBtn').style.display = state.quizSource === 'favorite' ? 'inline-flex' : 'none';
        }

        function setFocusMode(enabled) {
            if (!enabled && state.focusMode && state.focusStartTime) {
                state.focusBestSeconds = Math.max(state.focusBestSeconds || 0, Math.floor((Date.now() - state.focusStartTime) / 1000));
            }
            state.focusMode = enabled;
            document.body.classList.toggle('focus-active', enabled);
            updateBreadcrumbs(document.querySelector('.screen.active')?.id || 'homeScreen');
            $('focusBar').classList.toggle('show', enabled);
            $('focusIndicator').style.display = enabled ? 'inline-flex' : 'none';
            $('setupFocusToggle').classList.toggle('active', enabled);
            $('focusToggle').classList.toggle('active', enabled);
            if (enabled) {
                if (settings.sound.enabled) startSound();
            }
            if (enabled && !state.elapsedTimerId) {
                state.focusStartTime = Date.now();
                state.elapsedTimerId = setInterval(updateFocusTime, 1000);
            }
            if (!enabled && state.elapsedTimerId) {
                clearInterval(state.elapsedTimerId);
                state.elapsedTimerId = null;
                saveData();
            }
        }

        function updateFocusTime() {
            state.elapsedSeconds = Math.floor((Date.now() - state.focusStartTime) / 1000);
            state.focusBestSeconds = Math.max(state.focusBestSeconds || 0, state.elapsedSeconds);
            if (state.elapsedSeconds === 600) saveData();
            const m = String(Math.floor(state.elapsedSeconds / 60)).padStart(2, '0');
            const s = String(state.elapsedSeconds % 60).padStart(2, '0');
            $('focusTime').textContent = `${m}:${s}`;
        }

        function updateHomeStats() {
            $('totalAnswered').textContent = state.totalAnswered;
            $('totalCorrect').textContent = state.totalCorrect;
            $('currentStreak').textContent = settings.hideStreaks ? '--' : state.streak;
            $('favCount').textContent = state.favorites.length;
            subjectKeys().forEach(subject => {
                const level = state.levels[subject] || 1;
                const levelNode = $(`level-${subject}`);
                if (levelNode) levelNode.textContent = `\u5f53\u524d L${level}`;
            });
            const defaultAccuracy = state.defaultAnswered ? Math.round(state.defaultCorrect / state.defaultAnswered * 100) : 0;
            $('adaptiveAccuracy').textContent = `${defaultAccuracy}%`;
            $('adaptiveRatio').textContent = `${state.defaultCorrect}/${state.defaultAnswered}`;
            const averageLevel = Object.values(state.levels).reduce((a, b) => a + b, 0) / 3;
            $('adaptiveLevel').textContent = `L${Math.max(1, Math.round(averageLevel))}`;
            $('adaptiveStats').classList.add('visible');
            renderDataGateway();
            subjectKeys().forEach(subject => {
                const data = state.perSubject[subject];
                const acc = data.answered ? Math.round(data.correct / data.answered * 100) : 0;
                const avg = data.answered ? Math.max(1, Math.round(data.levelSum / data.answered)) : (state.levels[subject] || 1);
                $(`subjStats-${subject}`).textContent = `${data.correct}/${data.answered} \u00B7 ${acc}% \u00B7 L${avg}`;
                $(`subj-${subject}-accuracy`).textContent = `${acc}%`;
                $(`subj-${subject}-ratio`).textContent = `${data.correct}/${data.answered}`;
                $(`subj-${subject}-level`).textContent = `L${avg}`;
                $(`subj-${subject}-streak`).textContent = settings.hideStreaks ? '--' : data.bestStreak;
            });
            // Auto-render the mind map so it's visible on first load. Safe to
            // This is safe to call repeatedly; it rebuilds the SVG from current state.
            try { renderMindmap(); } catch (e) {}
        }

        function selectButton(group, value, multi = false) {
            const buttons = $$(`#${group} .option-btn`);
            const clicked = buttons.find(btn => btn.dataset.value === value);
            if (!clicked) return;
            if (multi) clicked.classList.toggle('selected');
            else buttons.forEach(btn => btn.classList.toggle('selected', btn === clicked));
        }

        function getSelectedValue(group, fallback) {
            return $(`#${group} .option-btn.selected`)?.dataset.value || fallback;
        }

        function getSelectedValues(group) {
            return $$(`#${group} .option-btn.selected`).map(btn => btn.dataset.value);
        }

        function resolveQuizLength() {
            let length;
            if (state.mode === 'custom') {
                const selected = getSelectedValue('customLengthOptions', '5');
                length = selected === 'custom'
                    ? Number($('customLengthInput')?.value || state.customLength || 0)
                    : Number(selected || state.customLength || 5);
                if (Number.isFinite(length) && length >= 5) state.customLength = Math.floor(length);
            } else {
                const selected = getSelectedValue('adaptiveLengthOptions', String(state.adaptiveLength || state.sessionLength || 5));
                length = Number(selected || state.adaptiveLength || state.sessionLength || 5);
                if (Number.isFinite(length) && length >= 5) state.adaptiveLength = Math.floor(length);
            }
            state.sessionLength = Math.max(0, Math.floor(Number.isFinite(length) ? length : 0));
            return Math.max(0, Math.floor(Number.isFinite(length) ? length : 0));
        }

        function setCustomLengthRowVisible(visible) {
            const row = $('customLengthRow');
            if (!row) return;
            row.hidden = !visible;
            row.classList.toggle('force-show', !!visible);
            row.style.display = visible ? 'flex' : 'none';
        }

        function syncLengthControlsFromState() {
            const adaptiveGroup = $('adaptiveLengthGroup');
            const customGroup = $('customLengthGroup');
            if (adaptiveGroup) adaptiveGroup.style.display = state.mode === 'custom' ? 'none' : 'block';
            if (customGroup) customGroup.style.display = state.mode === 'custom' ? 'block' : 'none';

            const adaptiveValue = String(Math.max(5, Math.floor(Number(state.adaptiveLength || state.sessionLength || 5))));
            const adaptiveButtonValue = $(`#adaptiveLengthOptions .option-btn[data-value="${adaptiveValue}"]`) ? adaptiveValue : '5';
            selectButton('adaptiveLengthOptions', adaptiveButtonValue);

            const customValue = Math.max(5, Math.floor(Number(state.customLength || state.sessionLength || 5)));
            if (state.mode === 'custom' && !$(`#customLengthOptions .option-btn[data-value="${customValue}"]`)) {
                selectButton('customLengthOptions', 'custom');
                if ($('customLengthInput')) $('customLengthInput').value = String(customValue);
                setCustomLengthRowVisible(true);
            } else {
                const value = $(`#customLengthOptions .option-btn[data-value="${customValue}"]`) ? String(customValue) : '5';
                selectButton('customLengthOptions', value);
                if ($('customLengthInput')) $('customLengthInput').value = '';
                setCustomLengthRowVisible(false);
            }
        }

        function bindLengthControls() {
            const adaptiveGroup = $('adaptiveLengthOptions');
            if (adaptiveGroup && adaptiveGroup.dataset.bound !== '1') {
                adaptiveGroup.dataset.bound = '1';
                adaptiveGroup.addEventListener('click', event => {
                    const btn = event.target.closest('.option-btn');
                    if (!btn || !adaptiveGroup.contains(btn)) return;
                    selectButton('adaptiveLengthOptions', btn.dataset.value);
                    state.adaptiveLength = Number(btn.dataset.value) || 5;
                    if (state.mode !== 'custom') state.sessionLength = state.adaptiveLength;
                    saveData();
                });
            }

            const customGroup = $('customLengthOptions');
            if (!customGroup || customGroup.dataset.bound === '1') {
                syncLengthControlsFromState();
                return;
            }
            customGroup.dataset.bound = '1';
            customGroup.addEventListener('click', event => {
                const btn = event.target.closest('.option-btn');
                if (!btn || !customGroup.contains(btn)) return;
                selectButton('customLengthOptions', btn.dataset.value);
                if (btn.dataset.value === 'custom') {
                    setCustomLengthRowVisible(true);
                    const value = Number($('customLengthInput')?.value || state.customLength || state.sessionLength || 5);
                    if ($('customLengthInput')) $('customLengthInput').value = String(Math.max(5, Math.floor(value)));
                    state.customLength = Math.max(5, Math.floor(value));
                    if (state.mode === 'custom') state.sessionLength = state.customLength;
                    requestAnimationFrame(() => $('customLengthInput')?.focus());
                } else {
                    setCustomLengthRowVisible(false);
                    if ($('customLengthInput')) $('customLengthInput').value = '';
                    state.customLength = Number(btn.dataset.value) || 5;
                    if (state.mode === 'custom') state.sessionLength = state.customLength;
                }
                saveData();
            });
            $('customLengthInput')?.addEventListener('input', () => {
                selectButton('customLengthOptions', 'custom');
                setCustomLengthRowVisible(true);
                const value = Number($('customLengthInput').value);
                if (Number.isFinite(value) && value >= 5) {
                    state.customLength = Math.floor(value);
                    if (state.mode === 'custom') state.sessionLength = state.customLength;
                    saveData();
                }
            });
            syncLengthControlsFromState();
        }

        function openSetup(mode = 'adaptive', subject = state.subject) {
            state.mode = mode;
            state.subject = subject;
            document.body.dataset.quizMode = mode;
            $$('.mode-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
            if (mode === 'custom') {
                const subjects = state.customSubjects?.length ? state.customSubjects : [subject];
                $$('#subjectOptions .option-btn').forEach(btn => btn.classList.toggle('selected', subjects.includes(btn.dataset.value)));
            } else {
                selectButton('subjectOptions', subject);
            }
            $('difficultyGroup').style.display = mode === 'custom' ? 'block' : 'none';
            $('timerGroup').style.display = mode === 'custom' ? 'block' : 'none';
            syncLengthControlsFromState();
            showScreen('setupScreen');
        }

        function shuffle(items) {
            const arr = [...items];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function takeBalancedQuestions(subjects, total, type, difficulty) {
            const selected = subjects.length ? subjects : ['calculus'];
            const targetDifficulty = Math.max(1, Math.min(10, Number(difficulty) || 5));
            const difficultyDistance = q => Math.abs((Number(q.difficulty) || targetDifficulty) - targetDifficulty);
            const buckets = selected.map(subject => {
                let base = getAllQuestions(subject);
                if (type !== 'all') base = base.filter(q => q.type === type);
                if (!base.length) base = getAllQuestions(subject);
                const exact = base.filter(q => Number(q.difficulty || 0) === targetDifficulty);
                const near = base.filter(q => Number(q.difficulty || 0) !== targetDifficulty && difficultyDistance(q) <= 2);
                const rest = base.filter(q => difficultyDistance(q) > 2);
                const pool = [...shuffle(exact), ...shuffle(near), ...shuffle(rest)];
                return { subject, pool };
            });
            const picked = [];
            let cursor = 0;
            while (picked.length < total && buckets.some(b => b.pool.length)) {
                const bucket = buckets[cursor % buckets.length];
                const q = bucket.pool.shift();
                if (q) picked.push({ ...q, subject: bucket.subject });
                cursor++;
            }
            return shuffle(picked).slice(0, total);
        }

        function recommendQuestions(subject, total, type) {
            const level = state.levels[subject] || 1;
            let pool = getAllQuestions(subject);
            if (type !== 'all') pool = pool.filter(q => q.type === type);
            if (!pool.length) pool = getAllQuestions(subject);
            const withState = pool.map(q => {
                const key = questionKey(q);
                const attempts = Math.max(0, Number(state.questionAttemptCounts?.[key] || 0));
                const score = Math.max(0, Math.min(100, Number(state.questionAccuracyScores?.[key] || 0)));
                const diffFit = Math.max(0, 1 - Math.abs((q.difficulty || level) - level) / 8);
                return { q, key, attempts, score, diffFit };
            });
            const newItems = withState.filter(item => item.attempts === 0);
            const doneItems = withState.filter(item => item.attempts > 0);
            const ratio = Math.max(0, Math.min(100, Number(settings.newQuestionRatio ?? 50))) / 100;
            const attemptCounts = doneItems.map(item => item.attempts);
            const minAttempts = attemptCounts.length ? Math.min(...attemptCounts) : 0;
            const maxAttempts = attemptCounts.length ? Math.max(...attemptCounts) : 0;
            const reviewCycleFinished = newItems.length > 0 && doneItems.length > 0 && minAttempts === maxAttempts;
            const forceNew = newItems.length > 0 && (doneItems.length === 0 || reviewCycleFinished);
            const targetNew = forceNew ? total : Math.min(newItems.length, Math.round(total * ratio));
            const rankNew = item => item.diffFit * 70 + Math.random() * 8;
            const rankReview = item => {
                const span = Math.max(1, maxAttempts - minAttempts);
                const leastAttemptBonus = doneItems.length ? 1 - ((item.attempts - minAttempts) / span) : 0;
                const weakScoreBonus = (100 - item.score) / 100;
                return weakScoreBonus * 52 + leastAttemptBonus * 30 + item.diffFit * 18 + Math.random() * 3;
            };
            const pickedItems = [];
            pickedItems.push(...newItems.sort((a, b) => rankNew(b) - rankNew(a)).slice(0, targetNew));
            if (!forceNew) {
                pickedItems.push(...doneItems.filter(item => !pickedItems.includes(item)).sort((a, b) => rankReview(b) - rankReview(a)).slice(0, total - pickedItems.length));
            }
            while (pickedItems.length < total) {
                const rest = withState.filter(item => !pickedItems.includes(item)).sort((a, b) => {
                    if (a.attempts !== b.attempts) return a.attempts - b.attempts;
                    return rankReview(b) - rankReview(a);
                });
                if (!rest.length) break;
                pickedItems.push(rest[0]);
            }
            let picked = pickedItems.map(item => item.q);
            return shuffle(picked).slice(0, total).map(q => ({ ...q, subject }));
        }

        async function startQuiz(questions = null, mode = state.mode, source = 'normal') {
            const length = resolveQuizLength();
            if (!questions && (!Number.isFinite(length) || length < 5)) {
            $('lengthError').textContent = '\u9898\u76ee\u6570\u91cf\u81f3\u5c11\u4e3a 5';
                $('lengthError').style.display = 'block';
                return;
            }
            $('lengthError').style.display = 'none';
            state.sessionLength = length;
            state.mode = mode;
            state.quizSource = source;
            state.questionType = getSelectedValue('typeOptions', 'all');
            state.customDifficulty = Number($('difficultyRange').value);
            state.timerMinutes = Number($('timerInput').value || 0);
            state.quizStartedAt = Date.now();
            let session;
            if (questions) {
                session = questions.map(q => normalizeQuizQuestion(q, q.subject || state.subject));
            } else if (state.mode === 'custom') {
                state.customSubjects = getSelectedValues('subjectOptions');
                if (!state.customSubjects.length) state.customSubjects = [state.subject || 'calculus'];
                const minPerSubject = Math.ceil(length / Math.max(1, state.customSubjects.length));
                await Promise.all(state.customSubjects.map(subject => ensureSubjectQuestions(subject, minPerSubject)));
                state.subject = state.customSubjects[0];
                session = takeBalancedQuestions(state.customSubjects, length, state.questionType, state.customDifficulty).map(q => normalizeQuizQuestion(q, q.subject || state.subject));
                if (session.length < length) {
                    state.customSubjects.forEach(subject => { questionDB[subject] = buildSubjectQuestions(subject); });
                    clearQuestionRuntimeCache();
                    session = takeBalancedQuestions(state.customSubjects, length, state.questionType, state.customDifficulty).map(q => normalizeQuizQuestion(q, q.subject || state.subject));
                }
            } else {
                state.subject = getSelectedValue('subjectOptions', state.subject);
                await ensureSubjectQuestions(state.subject, length);
                session = recommendQuestions(state.subject, length, state.questionType).map(q => normalizeQuizQuestion(q, state.subject));
                if (session.length < length) {
                    questionDB[state.subject] = buildSubjectQuestions(state.subject);
                    clearQuestionRuntimeCache();
                    session = recommendQuestions(state.subject, length, state.questionType).map(q => normalizeQuizQuestion(q, state.subject));
                }
            }
            state.sessionQuestions = session;
            state.currentQuestionIndex = 0;
            state.answers = [];
            trackEvent('quiz_start', {
                mode: state.mode,
                source: state.quizSource,
                subject: state.subject,
                subjects: state.mode === 'custom' ? state.customSubjects : [state.subject],
                count: session.length,
                type: state.questionType
            });
            applyWhiteboardHeight(Math.max(160, Math.min(260, Math.round(window.innerHeight * 0.24))));
            showScreen('quizScreen');
            updateQuizSoundUI();
            setFocusMode(state.focusMode);
            window.resetCalculatorPosition?.();
            startTimer();
            resizeWhiteboardCanvas();
            clearWhiteboard(false);
            renderQuestion();
        }

        function startTimer() {
            clearInterval(state.timerId);
            state.timerId = null;
            state.timerRemaining = state.timerMinutes * 60;
            const badge = $('timerBadge');
            if (!state.timerRemaining) {
                badge.style.display = 'none';
                return;
            }
            badge.style.display = 'inline-flex';
            const tick = () => {
                const m = String(Math.floor(state.timerRemaining / 60)).padStart(2, '0');
                const s = String(state.timerRemaining % 60).padStart(2, '0');
                $('timerText').textContent = `${m}:${s}`;
                badge.classList.toggle('urgent', state.timerRemaining <= 30);
                if (state.timerRemaining-- <= 0) finishQuiz();
            };
            tick();
            state.timerId = setInterval(tick, 1000);
        }

        function currentQuestion() {
            return state.sessionQuestions[state.currentQuestionIndex];
        }

        function renderQuestion() {
            let q = currentQuestion();
            if (!q) return finishQuiz();
            q = normalizeQuizQuestion(q, q.subject || state.subject);
            state.sessionQuestions[state.currentQuestionIndex] = q;
            // 重置 AI 教练状态
            if (typeof resetCoachForQuestion === 'function') resetCoachForQuestion();
            const quizSubject = q.subject || state.subject;
            $('quizSubject').textContent = getSubjectName(quizSubject);
            $('quizSubject').style.setProperty('--subject-color', getSubjectColor(quizSubject));
            $('quizSubject').style.setProperty('--subject-bg', `${getSubjectColor(quizSubject)}20`);
            $('quizDifficulty').textContent = `\u96be\u5ea6 ${q.difficulty}`;
            $('questionNumber').textContent = `\u9898\u76ee ${state.currentQuestionIndex + 1} / ${state.sessionQuestions.length}`;
            $('focusProgress').textContent = `${state.currentQuestionIndex + 1}/${state.sessionQuestions.length}`;
            $('progressFill').style.width = `${(state.currentQuestionIndex / state.sessionQuestions.length) * 100}%`;
            const questionTextNode = $('questionText');
            questionTextNode.innerHTML = htmlWithMath(moveLeadingQuestionTag(q.question));
            renderLatex(questionTextNode);
            const info = classifyQuestion(q);
            const doneCount = Number(state.questionAttemptCounts?.[questionKey(q)] || 0);
            const attemptHint = doneCount > 0 ? `<span class=\"attempt-hint\">\u5df2\u505a ${doneCount} \u6b21</span>` : '';
            $('questionInsights').innerHTML = `<span>\u9898\u578b: ${escapeHtml(info.topic)}</span>${info.keywords.map(word => `<span>${escapeHtml(word)}</span>`).join('')}${attemptHint}`;
            $('feedbackBox').className = 'feedback-box';
            $('feedbackBox').innerHTML = '';
            $('nextBtn').classList.remove('show');
            renderFavoriteState();
            const grid = $('choicesGrid');
            grid.innerHTML = '';
            if (q.type === 'choice') {
                (q.options || []).forEach((opt, index) => {
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn';
                    const label = document.createElement('span');
                    label.className = 'choice-label';
                    label.textContent = String.fromCharCode(65 + index);
                    const textSpan = document.createElement('span');
                    textSpan.className = 'choice-text';
                    const prepared = stripLatexDelimiters(opt);
                    if (window.katex && needsKatex(prepared)) {
                        try { katex.render(prepared, textSpan, { throwOnError: false }); }
                        catch (e) { textSpan.innerHTML = htmlWithMath(opt); }
                    } else {
                        textSpan.innerHTML = htmlWithMath(opt);
                    }
                    btn.appendChild(label);
                    btn.appendChild(textSpan);
                    btn.addEventListener('click', () => answerQuestion(index));
                    grid.appendChild(btn);
                });
            } else {
                const wrap = document.createElement('div');
                wrap.className = 'fill-answer';
                wrap.innerHTML = `<div class=\"fill-preview\" id=\"fillPreview\"></div><input type=\"text\" id=\"fillInput\" placeholder=\"\u8f93\u5165\u7b54\u6848\uff08\u652f\u6301 LaTeX\uff09\" style=\"width:100%;padding:14px 16px;border:2px solid #E2E8F0;border-radius:16px;font-size:16px;font-weight:700;margin-bottom:12px;\"><button class=\"primary-btn\" id=\"fillSubmit\" style=\"padding:14px 20px;font-size:16px;\">\u63d0\u4ea4\u7b54\u6848</button>`;
                grid.appendChild(wrap);
                $('fillSubmit').addEventListener('click', () => answerQuestion($('fillInput').value));
                $('fillInput').addEventListener('keydown', e => { if (e.key === 'Enter') answerQuestion(e.target.value); });
                $('fillInput').addEventListener('input', updateFillPreview);
                $('fillInput').focus();
            }
            renderLatex($('quizScreen'));
            adaptSoundToDifficulty(q.difficulty);
        }

        function replaceLatexFractions(text) {
            let s = String(text ?? '');
            for (let pass = 0; pass < 8 && /\\frac\s*\{/.test(s); pass++) {
                s = s.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '(($1)/($2))');
            }
            return s;
        }

        function expressionToJs(value) {
            let s = replaceLatexFractions(value);
            s = s.replace(/<\/?[^>]+>/g, '').replace(/\\[\(\)\[\]]/g, '').replace(/\$+/g, '');
            s = s.replace(/\\left|\\right/g, '');
            s = s.replace(/\\pi|π/g, 'Math.PI');
            s = s.replace(/\\sqrt\s*\{([^{}]+)\}/g, 'Math.sqrt($1)');
            s = s.replace(/\\cdot|\\times|×|·/g, '*');
            s = s.replace(/\\div|÷/g, '/');
            s = s.replace(/\\leq?|\u2264/g, '<=').replace(/\\geq?|\u2265/g, '>=').replace(/\\neq|\\ne|\u2260/g, '!=');
            s = s.replace(/\{/g, '(').replace(/\}/g, ')');
            s = s.replace(/\^/g, '**');
            s = s.replace(/(?<=\d)(?=Math\.PI|[a-zA-Z(])/g, '*');
            s = s.replace(/(?<=\))(?=(Math\.PI|[a-zA-Z0-9(]))/g, '*');
            s = s.replace(/(?<=[a-zA-Z0-9])(?=\()/g, '*');
            s = s.replace(/[^0-9+\-*/().,<>=!% MathPIsqrt]/g, '');
            return s.replace(/\s+/g, '');
        }

        function safeNumericValue(value) {
            const js = expressionToJs(value);
            if (!js || /[<>=!]/.test(js)) return null;
            try {
                const result = Function('"use strict"; return (' + js + ')')();
                return Number.isFinite(result) ? result : null;
            } catch (_) {
                return null;
            }
        }

        function answersEquivalent(user, expected) {
            const a = normalizeAnswer(user);
            const b = normalizeAnswer(expected);
            if (a === b) return true;
            const av = safeNumericValue(user);
            const bv = safeNumericValue(expected);
            if (av !== null && bv !== null) return Math.abs(av - bv) <= Math.max(1e-9, Math.abs(bv) * 1e-8);
            return false;
        }

        function canonicalAnswer(value) {
            let s = String(value).trim();
            // Strip HTML tags and LaTeX delimiters.
            s = s.replace(/<\/?[^>]+>/g, '').replace(/\\[\(\)\[\]]/g, '').replace(/\$+/g, '');
            s = s.toLowerCase().replace(/\s+/g, '');
            s = replaceLatexFractions(s);

            const reps = [
                [/\\\\pi|\\pi|π/g, 'pi'],
                [/\\\\alpha|\\alpha|α/g, 'alpha'],
                [/\\\\beta|\\beta|β/g, 'beta'],
                [/\\\\gamma|\\gamma|γ/g, 'gamma'],
                [/\\\\delta|\\delta|δ/g, 'delta'],
                [/\\\\theta|\\theta|θ/g, 'theta'],
                [/\\\\lambda|\\lambda|λ/g, 'lambda'],
                [/\\\\mu|\\mu|μ/g, 'mu'],
                [/\\\\sigma|\\sigma|σ/g, 'sigma'],
                [/\\\\phi|\\phi|φ/g, 'phi'],
                [/\\\\omega|\\omega|ω/g, 'omega'],
                [/\\\\infty|\\infty|∞/g, 'inf'],
                [/\\\\le|\\le|≤/g, '<='],
                [/\\\\ge|\\ge|≥/g, '>='],
                [/\\\\neq|\\neq|\\ne|≠/g, '!='],
                [/\\\\cdot|\\cdot|\\\\times|\\times|×|·/g, '*'],
                [/\\\\div|\\div|÷/g, '/'],
                [/\\\\sin/g, 'sin'],
                [/\\\\cos/g, 'cos'],
                [/\\\\tan/g, 'tan'],
                [/\\\\cot/g, 'cot'],
                [/\\\\sec/g, 'sec'],
                [/\\\\csc/g, 'csc'],
                [/\\\\ln/g, 'ln'],
                [/\\\\log/g, 'log'],
                [/\\\\exp/g, 'exp'],
                [/\\\\mid/g, '|'],
                [/\\\\mod/g, 'mod'],
                [/\\\\sqrt\{(.*?)\}/g, 'sqrt($1)'],
            ];
            reps.forEach(([re, replacement]) => { s = s.replace(re, replacement); });

            // Normalize implicit multiplication: 2x -> 2*x, 2pi -> 2*pi, )x -> )*x, x( -> x*(
            s = s.replace(/(\d)([a-z(])/g, '$1*$2');
            s = s.replace(/(\))([a-z0-9])/g, '$1*$2');
            s = s.replace(/([a-z0-9])(\()/g, '$1*$2');
            // Normalize power notation.
            s = s.replace(/\*\*/g, '^');
            // Remove remaining backslashes.
            s = s.replace(/\\/g, '');
            return s;
        }

        function normalizeAnswer(value) {
            return canonicalAnswer(value);
        }

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        function playSound(type) {
            const volume = (settings.soundVolume ?? 50) / 100;
            if (!volume || audioCtx.state === 'suspended') return;
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            gain.gain.setValueAtTime(volume * 0.25, now);
            if (type === 'correct') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(784, now);
                osc.frequency.setValueAtTime(1047, now + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.35);
            } else if (type === 'wrong') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.linearRampToValueAtTime(110, now + 0.25);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
            } else if (type === 'click') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(520, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                osc.start(now);
                osc.stop(now + 0.06);
            }
        }

        function vibrateFeedback(type) {
            if (!settings.vibrationEnabled) return;
            if (typeof navigator.vibrate !== 'function') return;
            if (type === 'correct') navigator.vibrate(30);
            else if (type === 'wrong') navigator.vibrate(200);
        }

        function answerQuestion(answer) {
            const q = currentQuestion();
            if (!q || $('nextBtn').classList.contains('show')) return;
            const correct = q.type === 'choice' ? Number(answer) === Number(q.answer) : answersEquivalent(answer, q.answer);
            const info = classifyQuestion(q);
            state.answers.push({ id: q.id, subject: q.subject, topic: info.topic, correct, difficulty: q.difficulty });
            state.totalAnswered++;
            if (correct) {
                state.totalCorrect++;
                state.streak++;
                playSound('correct');
                vibrateFeedback('correct');
            } else {
                state.streak = 0;
                playSound('wrong');
                vibrateFeedback('wrong');
                adaptSoundToErrors();
            }
            state.allModeStats.answered++;
            if (correct) state.allModeStats.correct++;
            state.allModeStats.levelSum += q.difficulty || 0;
            const allSubject = state.allSubjectStats[q.subject] || { answered: 0, correct: 0, levelSum: 0 };
            allSubject.answered++;
            if (correct) allSubject.correct++;
            allSubject.levelSum += q.difficulty || 0;
            state.allSubjectStats[q.subject] = allSubject;
            const qKey = questionKey(q);
            const attemptCount = Number(state.questionAttemptCounts[qKey] || 0) + 1;
            state.questionAttemptCounts[qKey] = attemptCount;
            if (Number(q.difficulty || 0) >= 10) state.achievementFlags.difficulty10 = true;
            state.answeredQuestionKeys[qKey] = true;
            state.questionLastCorrect[qKey] = correct;
            const previousScore = Math.max(0, Math.min(100, Number(state.questionAccuracyScores?.[qKey] || 0)));
            state.questionAccuracyScores[qKey] = Math.max(0, Math.min(100, previousScore + (correct ? 50 : -25)));
            questionScoreRevision++;
            if (correct) state.correctQuestionKeys[qKey] = true;
            if (state.mode === 'adaptive') {
                state.defaultAnswered++;
                if (correct) state.defaultCorrect++;
                const data = state.perSubject[q.subject];
                data.answered++;
                if (correct) {
                    data.correct++;
                    data.currentStreak++;
                } else {
                    data.currentStreak = 0;
                }
                data.bestStreak = Math.max(data.bestStreak, data.currentStreak);
                data.levelSum += q.difficulty;
                if (correct && data.currentStreak % 3 === 0) state.levels[q.subject] = Math.min(10, (state.levels[q.subject] || 1) + 1);
                if (!correct) state.levels[q.subject] = Math.max(1, (state.levels[q.subject] || 1) - 1);
            }
            const topicStatKey = topicKey(q.subject, info.topic);
            const topicStat = state.topicStats[topicStatKey] || { answered: 0, correct: 0 };
            topicStat.answered++;
            if (correct) topicStat.correct++;
            state.topicStats[topicStatKey] = topicStat;
            state.recentPractice.push({ at: new Date().toISOString(), subject: q.subject, topic: info.topic, type: q.type, difficulty: q.difficulty, correct });
            state.recentPractice = state.recentPractice.slice(-500);
            showFeedback(correct, q, answer);
            trackEvent('answer', {
                questionId: q.id,
                questionKey: qKey,
                attemptCount,
                subject: q.subject,
                topic: info.topic,
                type: q.type,
                difficulty: q.difficulty,
                correct,
                index: state.currentQuestionIndex + 1,
                total: state.sessionQuestions.length
            });
            updateHomeStats();
            bankPageCache.clear();
            saveData();
        }

        function showFeedback(correct, q, answer) {
            const box = $('feedbackBox');
            box.className = `feedback-box show ${correct ? 'correct' : 'wrong'}`;
            let correctText = '';
            correctText = `\u6b63\u786e\u7b54\u6848\uff1a${answerDisplayHtml(q)}`;
            box.innerHTML = `<strong>${correct ? '\u7b54\u5bf9\u4e86' : '\u518d\u60f3\u60f3'}</strong><br>${correctText}<br>${htmlWithMath(q.explanation || '')}`;
            if (q.type === 'choice') {
                $$('#choicesGrid .choice-btn').forEach((btn, index) => {
                    btn.disabled = true;
                    if (index === Number(q.answer)) btn.classList.add('correct');
                    if (index === Number(answer) && !correct) btn.classList.add('wrong');
                });
            }
            $('nextBtn').textContent = state.currentQuestionIndex >= state.sessionQuestions.length - 1 ? '\u5b8c\u6210\u7ec3\u4e60 \u2713' : '\u4e0b\u4e00\u9898 \u2192';
            $('nextBtn').classList.add('show');
            renderLatex(box);
        }

        function nextQuestion() {
            state.currentQuestionIndex++;
            if (state.currentQuestionIndex >= state.sessionQuestions.length) finishQuiz();
            else {
                clearWhiteboard(false);
                renderQuestion();
            }
        }

        const summaryPools = {
            high: [
                ['OK', '这组很稳', '节奏和准确率都在线，保持这个手感。'],
                ['A+', '漂亮收束', '大部分题都处理得很干净，可以继续推进细分题型。'],
                ['UP', '状态很好', '这组完成度很高，下一组可以尝试更高难度。'],
                ['HI', '掌握感上来了', '正确率说明这块知识已经比较熟。']
            ],
            mid: [
                ['M1', '练得正好', '有对有错，正适合定位薄弱题型。'],
                ['M2', '找到切入点了', '这组暴露的问题很有价值，复盘会很有效。'],
                ['M3', '继续打磨', '整体方向没问题，把错题对应题型再补一轮。'],
                ['M4', '稳步推进', '正确率在可训练区间，下一组继续按弱项推送。']
            ],
            low: [
                ['L1', '先把节奏降下来', '这组偏难，建议从同题型低一档题目重新进入。'],
                ['L2', '薄弱点已经出现', '不要急着刷量，先看解析和关键词。'],
                ['L3', '从基础题重建', '这组的价值是告诉系统下一步该推哪些题。'],
                ['L4', '拆小一点', '先集中处理一个题型，正确率会更快回来。']
            ]
        };

        function pickSummary(accuracy) {
            const group = accuracy >= 80 ? summaryPools.high : accuracy >= 50 ? summaryPools.mid : summaryPools.low;
            return group[Math.floor(Math.random() * group.length)];
        }

        function finishQuiz() {
            clearInterval(state.timerId);
            state.timerId = null;
            const correct = state.answers.filter(a => a.correct).length;
            const wrong = state.answers.length - correct;
            const accuracy = state.answers.length ? Math.round(correct / state.answers.length * 100) : 0;
            const durationSec = state.quizStartedAt ? Math.max(0, Math.round((Date.now() - state.quizStartedAt) / 1000)) : 0;
            if (state.answers.length >= 20) state.achievementFlags.longSession20 = true;
            if (Number(state.timerMinutes || 0) > 0) state.achievementFlags.timerSession = true;
            $('summaryCorrect').textContent = correct;
            $('summaryWrong').textContent = wrong;
            $('summaryAccuracy').textContent = `${accuracy}%`;
            const [emoji, title, desc] = pickSummary(accuracy);
            $('summaryEmoji').textContent = emoji;
            $('summaryTitle').textContent = title;
            $('summaryDesc').textContent = `${desc} 共完成 ${state.answers.length} 题，正确 ${correct} 题。`;
            $('difficultyNote').textContent = state.mode === 'adaptive' ? '\u9ed8\u8ba4\u6a21\u5f0f\u5df2\u6839\u636e\u7b54\u9898\u8868\u73b0\u8c03\u6574\u96be\u5ea6\u3002' : '\u672c\u6b21\u7ec3\u4e60\u4e0d\u6539\u53d8\u9ed8\u8ba4\u6a21\u5f0f\u7684\u96be\u5ea6\u3002';
            $('progressFill').style.width = '100%';
            state.sessionHistory.push({
                at: new Date().toISOString(),
                mode: state.mode,
                source: state.quizSource,
                total: state.answers.length,
                correct,
                wrong,
                accuracy,
                durationSec,
                timerMinutes: Number(state.timerMinutes || 0),
                focusMode: !!state.focusMode,
                avgDifficulty: state.answers.length ? (state.answers.reduce((sum, item) => sum + (item.difficulty || 0), 0) / state.answers.length).toFixed(1) : '0.0',
                questions: state.sessionQuestions.map(q => ({
                    id: q.id,
                    subject: q.subject,
                    type: q.type,
                    difficulty: q.difficulty,
                    question: q.question,
                    options: q.options || [],
                    answer: q.answer,
                    explanation: q.explanation || '',
                    meta: q.meta || null
                }))
            });
            state.sessionHistory = state.sessionHistory.slice(-40);
            updateSummaryReturnButtons();
            trackEvent('quiz_finish', {
                mode: state.mode,
                source: state.quizSource,
                total: state.answers.length,
                correct,
                wrong,
                accuracy
            });
            showScreen('summaryScreen');
            updateHomeStats();
            saveData();
        }

        function favoriteKey(q) {
            return `${q.subject || state.subject}::${q.id}::${normalizeStem(q.question).slice(0, 48)}`;
        }

        function isFavorited(q) {
            const key = favoriteKey(q);
            return state.favorites.some(item => item.key === key);
        }

        function toggleFavorite(q = currentQuestion()) {
            if (!q) return;
            const key = favoriteKey(q);
            const index = state.favorites.findIndex(item => item.key === key);
            if (index >= 0) state.favorites.splice(index, 1);
            else state.favorites.push({ key, question: { ...q, subject: q.subject || state.subject } });
            renderFavoriteState();
            updateHomeStats();
            saveData();
        }

        function renderFavoriteState() {
            const q = currentQuestion();
            const active = q && isFavorited(q);
            $('favToggle').classList.toggle('active', active);
            $('favToggle').textContent = active ? '\u2665 \u5df2\u6536\u85cf' : '\u2661 \u6536\u85cf';
        }

        function questionPayload(q) {
            const info = classifyQuestion(q);
            const answer = q.type === 'choice' ? `${String.fromCharCode(65 + Number(q.answer))}. ${q.options[Number(q.answer)] || ''}` : q.answer;
            return {
                subject: q.subject,
                subjectName: getSubjectName(q.subject),
                topic: info.topic,
                keywords: info.keywords,
                difficulty: q.difficulty,
                type: q.type,
                question: moveLeadingQuestionTag(q.question),
                options: q.options || [],
                answer,
                explanation: q.explanation || ''
            };
        }

        function questionToText(q) {
            const p = questionPayload(q);
            const options = p.type === 'choice' ? `\n\u9009\u9879\n${p.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}` : '';
            return `科目：${p.subjectName}\n题型：${p.topic}\n关键词：${p.keywords.join('、')}\n难度：L${p.difficulty}\n题目：${p.question}${options}\n答案：${p.answer}\n解析：${p.explanation}\n`;
        }

        function questionToMarkdown(q) {
            const p = questionPayload(q);
            const options = p.type === 'choice' ? `\n${p.options.map((opt, i) => `- ${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}` : '';
            return `# ${p.subjectName}\n\n- 题型: ${p.topic}\n- 关键词: ${p.keywords.join('、')}\n- 难度: L${p.difficulty}\n\n## 题目\n${p.question}${options}\n\n## 答案\n${p.answer}\n\n## 解析\n${p.explanation}\n`;
        }

        function questionToCsv(q) {
            const p = questionPayload(q);
            const cells = [
                p.subjectName, p.topic, p.keywords.join('、'), `L${p.difficulty}`, p.type, p.question,
                p.options.join(' || '), p.answer, p.explanation
            ].map(cell => `"${String(cell).replace(/"/g, '""')}"`);
            return ['subject,topic,keywords,difficulty,type,question,options,answer,explanation', cells.join(',')].join('\n');
        }

        function questionToJson(q) {
            return JSON.stringify(questionPayload(q), null, 2);
        }

        const questionExportFormats = [
            ['txt', 'TXT'],
            ['json', 'JSON'],
            ['csv', 'CSV'],
            ['md', 'Markdown']
        ];
        const graphExportFormats = [
            ['svg', 'SVG'],
            ['png', 'PNG'],
            ['json', 'JSON'],
            ['csv', 'CSV'],
            ['md', 'Markdown']
        ];

        function fillSelectOptions(select, options, value) {
            if (!select) return;
            select.innerHTML = options.map(([v, label]) => `<option value="${v}">${label}</option>`).join('');
            select.value = value;
        }

        function initExportSelectors() {
            fillSelectOptions($('questionExportFormat'), questionExportFormats, settings.exportFormat || 'txt');
            fillSelectOptions($('mindmapExportFormat'), graphExportFormats, settings.graphExportFormat || 'svg');
            fillSelectOptions($('networkExportFormat'), graphExportFormats, settings.graphExportFormat || 'svg');
        }

        function downloadText(filename, text, type = 'text/plain;charset=utf-8') {
            const blob = new Blob([text], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }

        function exportQuestion(q, format = settings.exportFormat || 'txt') {
            if (!q) return;
            const base = `focusmath-${q.subject}-${q.id || Date.now()}`;
            if (format === 'json') downloadText(`${base}.json`, questionToJson(q), 'application/json;charset=utf-8');
            else if (format === 'csv') downloadText(`${base}.csv`, questionToCsv(q), 'text/csv;charset=utf-8');
            else if (format === 'md') downloadText(`${base}.md`, questionToMarkdown(q), 'text/markdown;charset=utf-8');
            else downloadText(`${base}.txt`, questionToText(q), 'text/plain;charset=utf-8');
        }

        function exportCurrentQuestion() {
            exportQuestion(currentQuestion(), $('questionExportFormat')?.value || settings.exportFormat || 'txt');
        }

        function firstQuestionChar(q) {
            const text = moveLeadingQuestionTag(q.question || '').replace(/\\\(|\\\)|[\s`~!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?\uFF0C\u3002\uFF01\uFF1F\uFF1B\uFF1A\uFF08\uFF09\u3010\u3011\u300A\u300B\u3001]/g, '');
            return (text.match(/[\u4e00-\u9fa5A-Za-z0-9]/)?.[0] || (q.type === 'choice' ? 'A' : '\u586b')).toUpperCase();
        }

        function normalizeChoiceAnswer(answer, optionCount) {
            if (typeof answer === 'number') return Math.max(0, Math.min(optionCount - 1, answer));
            const text = String(answer ?? '').trim();
            const letter = text.match(/^[A-Za-z]/)?.[0];
            if (letter) {
                const index = letter.toUpperCase().charCodeAt(0) - 65;
                if (index >= 0 && index < optionCount) return index;
            }
            const numeric = Number(text);
            if (Number.isFinite(numeric)) return Math.max(0, Math.min(optionCount - 1, numeric));
            return 0;
        }

        function normalizeQuizQuestion(q, fallbackSubject = state.subject) {
            const item = { ...(q || {}) };
            item.subject = item.subject || fallbackSubject || state.bankSubject || 'calculus';
            item.difficulty = Number(item.difficulty || item.meta?.difficulty || 1);
            if (!Number.isFinite(item.difficulty)) item.difficulty = 1;
            item.question = String(item.question || item.stem || '').trim();
            item.explanation = String(item.explanation || '');
            const rawOptions = Array.isArray(item.options)
                ? item.options.map(String).filter(Boolean)
                : String(item.options || '').split(/[,\n;；|]+/).map(x => x.trim()).filter(Boolean);
            const typeText = String(item.type || item.q_type || item.meta?.type || '').toLowerCase();
            const isChoice = typeText === 'choice' || typeText.includes('选择') || (rawOptions.length >= 2 && !typeText.includes('填空') && typeText !== 'fill');
            item.type = isChoice ? 'choice' : 'fill';
            if (item.type === 'choice') {
                item.options = rawOptions.length >= 2 ? rawOptions : ['正确', '错误'];
                item.answer = normalizeChoiceAnswer(item.answer, item.options.length);
            } else {
                delete item.options;
                item.answer = String(item.answer ?? '');
            }
            return item;
        }

        function renderPreview(container, q, source = 'normal') {
            q = normalizeQuizQuestion(q, q?.subject || state.bankSubject || state.subject);
            container.classList.add('active');
            const subject = q.subject || state.bankSubject || state.subject || '';
            const subjectName = getSubjectName(subject);
            const subjectColor = getSubjectColor(subject);
            const options = q.type === 'choice' ? `<div class="preview-options">${(q.options || []).map((opt, i) => `<div class="preview-option">${String.fromCharCode(65 + i)}. ${htmlWithMath(opt)}</div>`).join('')}</div>` : '';
            const answerBlock = source === 'favorite' && settings.favoritePreviewAnswer
                ? `<div class=\"preview-answer\">\u7b54\u6848: ${answerDisplayHtml(q)}</div>`
                : '';
            container.innerHTML = `
                <span class="preview-subject" style="--subject-color:${subjectColor};--subject-bg:${subjectColor}20;">${escapeHtml(subjectName)}</span>
                <div class=\"preview-difficulty\">\u96be\u5ea6 ${q.difficulty} \u00B7 ${q.type === 'choice' ? '\u9009\u62e9\u9898' : '\u586b\u7a7a\u9898'}</div>
                <div class="preview-question">${htmlWithMath(moveLeadingQuestionTag(q.question))}</div>
                ${options}
                ${answerBlock}
                <div class="preview-export-row">
                    <button class="preview-enter preview-export">导出这道题</button>
                    <select class="settings-select preview-export-format">${questionExportFormats.map(([v, label]) => `<option value="${v}" ${v === (settings.exportFormat || 'txt') ? 'selected' : ''}>${label}</option>`).join('')}</select>
                </div>
                <button class="preview-enter">进入这道题</button>
            `;
            container.querySelector('.preview-export').addEventListener('click', () => exportQuestion(q, container.querySelector('.preview-export-format')?.value || settings.exportFormat || 'txt'));
            container.querySelector('.preview-enter:not(.preview-export)').addEventListener('click', () => startQuiz([q], 'preview', source));
            renderLatex(container);
        }

        function openQuestionPreviewFromHistory(q) {
            if (!q) return;
            const modal = $('questionPreviewModal');
            const wrap = $('questionPreviewWrap');
            if (!modal || !wrap) return;
            wrap.innerHTML = '';
            const panel = document.createElement('div');
            panel.className = 'preview-panel active';
            panel.innerHTML = `
                <span class="preview-subject" style="--subject-color:${getSubjectColor(q.subject)};--subject-bg:${getSubjectColor(q.subject)}20;">${escapeHtml(getSubjectName(q.subject))}</span>
                <div class="preview-difficulty">难度 ${q.difficulty} · ${q.type === 'choice' ? '选择题' : '填空题'}</div>
                <div class="preview-question">${htmlWithMath(moveLeadingQuestionTag(q.question))}</div>
                ${q.type === 'choice' ? `<div class="preview-options">${(q.options || []).map((opt, i) => `<div class="preview-option">${String.fromCharCode(65 + i)}. ${htmlWithMath(opt)}</div>`).join('')}</div>` : ''}
                <div class="preview-answer">答案: ${answerDisplayHtml(q)}</div>
                <div class="preview-export-row">
                    <button class="preview-enter preview-export">导出这道题</button>
                    <select class="settings-select preview-export-format">${questionExportFormats.map(([v, label]) => `<option value="${v}" ${v === (settings.exportFormat || 'txt') ? 'selected' : ''}>${label}</option>`).join('')}</select>
                </div>
            `;
            wrap.appendChild(panel);
            panel.querySelector('.preview-export').addEventListener('click', () => exportQuestion(q, panel.querySelector('.preview-export-format')?.value || settings.exportFormat || 'txt'));
            renderLatex(panel);
            modal.classList.add('show');
        }

        function resetBankPreview() {
            currentBankQuestion = null;
            const panel = $('bankPreview');
            if (!panel) return;
            panel.classList.remove('active');
            panel.innerHTML = '<div class=\"preview-empty\">\u70b9\u51fb\u5de6\u4fa7\u4efb\u610f\u9898\u76ee\u9884\u89c8\u5185\u5bb9</div>';
        }

        function findQuestionById(id) {
            if (!id) return null;
            for (const subject of subjectKeys()) {
                const found = getAllQuestions(subject).find(q => q.id === id);
                if (found) return { ...found, subject: found.subject || subject };
            }
            return null;
        }

        function replayHistorySession(item) {
            const saved = Array.isArray(item?.questions) ? item.questions : [];
            if (!saved.length) return;
            const questions = saved.map(q => {
                const current = findQuestionById(q.id);
                return { ...(current || q), subject: q.subject || current?.subject || state.subject };
            }).filter(Boolean);
            if (!questions.length) return;
            startQuiz(questions, item.mode || 'history', 'history');
        }

        async function exportFavoritesToAnki() {
            if (!state.favorites.length) { alert('\u6536\u85cf\u5939\u4e3a\u7a7a\uff0c\u65e0\u6cd5\u5bfc\u51fa'); return; }
            const btn = $('exportAnkiBtn');
            if (btn) { btn.disabled = true; btn.textContent = '\u6b63\u5728\u751f\u6210...'; }
            try {
                // Load sql.js.
                const SQL = await initSqlJs({ locateFile: file => `vendor/sql.js/${file}` });
                const db = new SQL.Database();

                // Create the Anki collection database.
                db.run(`
                    CREATE TABLE col (id integer PRIMARY KEY, crt integer NOT NULL, mod integer NOT NULL, scm integer NOT NULL, ver integer NOT NULL, dty integer NOT NULL, usn integer NOT NULL, ls integer NOT NULL, conf text NOT NULL, models text NOT NULL, decks text NOT NULL, dconf text NOT NULL, tags text NOT NULL);
                    CREATE TABLE notes (id integer PRIMARY KEY, guid text NOT NULL, mid integer NOT NULL, mod integer NOT NULL, usn integer NOT NULL, tags text NOT NULL, flds text NOT NULL, sfld text NOT NULL, csum integer NOT NULL, flags integer NOT NULL, data text NOT NULL);
                    CREATE TABLE cards (id integer PRIMARY KEY, nid integer NOT NULL, did integer NOT NULL, ord integer NOT NULL, mod integer NOT NULL, usn integer NOT NULL, type integer NOT NULL, queue integer NOT NULL, due integer NOT NULL, ivl integer NOT NULL, factor integer NOT NULL, reps integer NOT NULL, lapses integer NOT NULL, left integer NOT NULL, odue integer NOT NULL, odid integer NOT NULL, flags integer NOT NULL, data text NOT NULL);
                    CREATE TABLE revlog (id integer PRIMARY KEY, cid integer NOT NULL, usn integer NOT NULL, ease integer NOT NULL, ivl integer NOT NULL, lastIvl integer NOT NULL, factor integer NOT NULL, time integer NOT NULL, type integer NOT NULL);
                    CREATE TABLE graves (usn integer NOT NULL, oid integer NOT NULL, type integer NOT NULL);
                `);

                const now = Math.floor(Date.now() / 1000);
                const modelId = 1607392319;
                const deckId = 1;

                // Configure the col table.
                const models = JSON.stringify({
                    [modelId]: {
                        id: modelId, name: "Basic", type: 0, mod: 0, usn: -1, sortf: 0, did: 1,
                        tmpls: [{ name: "Card 1", ord: 0, qfmt: "{{Front}}", afmt: '{{FrontSide}}<hr id="answer">{{Back}}', bqfmt: "", bafmt: "" }],
                        flds: [{ name: "Front", ord: 0, sticky: false, rtl: false, font: "Noto Sans", size: 20 }, { name: "Back", ord: 1, sticky: false, rtl: false, font: "Noto Sans", size: 20 }],
                        css: ".card { font-family: 'Noto Sans', sans-serif; font-size: 20px; text-align: center; color: black; background-color: white; }",
                        latexPre: "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
                        latexPost: "\\end{document}",
                        req: [[0, "any", [0]]], tags: [], vers: []
                    }
                });
                const decks = JSON.stringify({
                    "1": { id: 1, name: "FocusMath收藏夹", mod: 0, usn: -1, desc: "", dyn: 0, collapsed: false, browserCollapsed: false, extendNew: 10, extendRev: 50, conf: 1, newToday: [0, 0], revToday: [0, 0], lrnToday: [0, 0], timeToday: [0, 0] }
                });
                const dconf = JSON.stringify({
                    "1": { id: 1, name: "Default", mod: 0, usn: -1, autoplay: true, dyn: false, maxTaken: 60, replayq: true, timer: 0, new: { bury: false, delays: [1, 10], initialFactor: 2500, ints: [1, 4, 7], order: 1, perDay: 20, separate: true }, rev: { bury: false, ease4: 1.3, fuzz: 0.05, ivlFct: 1.0, maxIvl: 36500, minSpace: 1, perDay: 200, hardFactor: 1.2 }, lapse: { delays: [10], leechAction: 1, leechFails: 8, minInt: 1, mult: 0.0 } }
                });
                const conf = JSON.stringify({ activeDecks: [1], addToCur: true, collapseTime: 1200, curDeck: 1, curModel: modelId, dueCounts: true, estTimes: true, newBury: true, newSpread: 0, nextPos: 1, sortBackwards: false, sortType: "noteFld", timeLim: 0 });

                db.run("INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags) VALUES (1, ?, ?, ?, 11, 0, -1, 0, ?, ?, ?, ?, '{}')", [now, now * 1000, now * 1000, conf, models, decks, dconf]);

                // Add favorite questions to notes and cards.
                let cardDue = 0;
                state.favorites.forEach((item, index) => {
                    const q = item.question;
                    const noteId = Date.now() + index;
                    const guid = Math.random().toString(36).slice(2, 12);
                    const front = q.question + (q.type === 'choice' && q.options ? '<br>' + q.options.map((opt, i) => String.fromCharCode(65 + i) + '. ' + opt).join('<br>') : '');
                    const back = (q.type === 'choice' && q.options ? String.fromCharCode(65 + Number(q.answer)) + '. ' + (q.options[Number(q.answer)] || '') + '<br>' : '') + (q.explanation || '');
                    const flds = front + '\x1f' + back;
                    db.run("INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data) VALUES (?, ?, ?, ?, -1, '', ?, '', 0, 0, '')", [noteId, guid, modelId, now, flds]);
                    db.run("INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data) VALUES (?, ?, ?, 0, ?, -1, 0, 0, ?, 0, 0, 0, 0, 0, 0, 0, 0, '')", [noteId + 1, noteId, deckId, now, cardDue++]);
                });

                // Export database.
                const dbData = db.export();

                // Create apkg with JSZip.
                const zip = new JSZip();
                zip.file('collection.anki2', dbData);
                zip.file('media', '{}');
                const blob = await zip.generateAsync({ type: 'blob' });

                // Download.
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `focusmath-favorites-${new Date().toISOString().slice(0, 10)}.apkg`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);

                if (btn) { btn.disabled = false; btn.textContent = '\u5bfc\u51fa Anki'; }
            } catch (error) {
                console.error('Anki export failed', error);
                alert('\u5bfc\u51fa\u5931\u8d25: ' + error.message);
                if (btn) { btn.disabled = false; btn.textContent = '\u5bfc\u51fa Anki'; }
            }
        }

        function renderFavorites() {
            const groups = { calculus: $('favCalculus').querySelector('.fav-grid'), linear: $('favLinear').querySelector('.fav-grid'), probability: $('favProbability').querySelector('.fav-grid') };
            Object.values(groups).forEach(grid => grid.innerHTML = '');
            Object.entries(groups).forEach(([subject, grid]) => {
                const items = state.favorites.filter(item => item.question.subject === subject);
                if (!items.length) {
                grid.innerHTML = '<div class=\"empty-fav\">\u8fd8\u6ca1\u6709\u6536\u85cf</div>';
                    return;
                }
                items.forEach((item, index) => {
                    const q = item.question;
                    const btn = document.createElement('button');
                    btn.className = `fav-btn subject-${subject}`;
                    btn.innerHTML = `<span class="idx">${index + 1}</span><span class="char">${firstQuestionChar(q)}</span>`;
                    btn.addEventListener('click', () => {
                        currentFavQuestion = q;
                        renderPreview($('favPreview'), q, 'favorite');
                    });
                    grid.appendChild(btn);
                });
            });
        }

        function difficultyClass(diff) {
            if (diff <= 3) return 'diff-easy';
            if (diff <= 6) return 'diff-medium';
            if (diff <= 8) return 'diff-hard';
            return 'diff-expert';
        }

        function bankTopicOptions(subject) {
            const cacheKey = `${subject}:${questionBankRevision}`;
            if (bankTopicCache.has(cacheKey)) return bankTopicCache.get(cacheKey);
            if (backendQuestionIndex.filters?.[subject]?.length) {
                const options = backendQuestionIndex.filters[subject];
                bankTopicCache.set(cacheKey, options);
                return options;
            }
            const options = [
                { value: 'all', label: '全部题目' },
                { value: 'type:choice', label: '全部选择题' },
                { value: 'type:fill', label: '全部填空题' },
                { value: 'difficulty:1-3', label: 'L1-L3 基础' },
                { value: 'difficulty:4-6', label: 'L4-L6 常规' },
                { value: 'difficulty:7-10', label: 'L7-L10 提升' },
                { value: 'practice:wrong', label: '错题' },
                { value: 'practice:low', label: '低正确率' },
                { value: 'imported:false', label: '默认题' },
                { value: 'imported:true', label: '导入题' },
            ];
            const topicSet = new Set();
            const keywordSet = new Set();
            const sourceSet = new Set();
            getBankIndex(subject).forEach(item => {
                if (item.info?.topic) topicSet.add(item.info.topic);
                (item.info?.keywords || []).forEach(word => keywordSet.add(word));
                const source = item.q?.source || (item.imported ? 'manual-import' : 'default');
                if (source && source !== 'default') sourceSet.add(source);
            });
            Array.from(sourceSet).sort().slice(0, 12).forEach(source => options.push({ value: `source:${source}`, label: `来源 ${source}` }));
            Array.from(topicSet).sort().slice(0, 40).forEach(topic => {
                if (!['选择题', '填空题'].includes(topic)) options.push({ value: `topic:${topic}`, label: topic });
            });
            Array.from(keywordSet).sort().slice(0, 36).forEach(keyword => {
                if (!topicSet.has(keyword)) options.push({ value: `keyword:${keyword}`, label: keyword });
            });
            bankTopicCache.set(cacheKey, options);
            return options;
        }

        async function loadBankRemotePages(page = state.bankPage, { render = false, force = false, scrollAnchor = null } = {}) {
            const subject = state.bankSubject;
            const search = state.bankSearch;
            const filters = Array.isArray(state.bankTopicFilters) ? [...state.bankTopicFilters] : [];
            const requestKey = bankRemoteKeyFor(subject, search, filters, page);
            if (!force && bankRemotePageCache.has(requestKey)) {
                if (render && $('bankScreen')?.classList.contains('active')) {
                    const savedScroll = captureBankScrollAnchor();
                    requestAnimationFrame(() => { renderBank({ skipFetch: true }); restoreBankScrollAnchor(savedScroll); });
                }
                return { ok: true, cached: true, items: bankRemotePageCache.get(requestKey) };
            }
            const controllerKey = `${requestKey}:${Date.now()}`;
            bankRemoteRequest = controllerKey;
            bankRemoteLoadingKey = requestKey;
            bankRemoteError = '';
            const savedScrollForRender = scrollAnchor || captureBankScrollAnchor();
            const abort = new AbortController();
            const timeoutId = setTimeout(() => abort.abort(), 12000);
            try {
                const res = await fetch(apiUrl('/api/question-page'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: abort.signal,
                    body: JSON.stringify({
                        subject,
                        search,
                        filters,
                        page,
                        pageSize: bankPageSize(),
                        preload: BANK_PRELOAD_PAGES,
                        attempts: questionAttemptPayload()
                    })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!data.ok) throw new Error(data.error || 'page failed');
                if (bankRemoteRequest !== controllerKey) return data;
                const previousRevision = bankRemoteMeta.revision;
                bankRemoteMeta = { total: data.total, pages: data.pages, pageSize: data.pageSize, subject: data.subject, revision: data.revision || previousRevision || '' };
                if (previousRevision && bankRemoteMeta.revision && previousRevision !== bankRemoteMeta.revision) {
                    bankRemotePageCache.clear();
                    bankRemoteMetaCache.clear();
                    bankPageCache.clear();
                }
                bankRemoteMetaCache.set(bankRemoteMetaKeyFor(subject, search, filters), { ...bankRemoteMeta });
                bankRemoteError = '';
                if (Array.isArray(data.filters)) {
                    bankTopicCache.set(`${data.subject}:${questionBankRevision}`, data.filters);
                    const filterWrap = $('bankTopicFilter');
                    if (filterWrap && data.subject === state.bankSubject) filterWrap.dataset.renderKey = '';
                }
                Object.entries(data.loadedPages || {}).forEach(([pageNo, items]) => {
                    const key = bankRemoteKeyFor(subject, search, filters, Number(pageNo));
                    bankRemotePageCache.set(key, items);
                });
                bankPageCache.clear();
                if (bankRemoteRequest === controllerKey && render && $('bankScreen')?.classList.contains('active')) {
                    renderBank({ skipFetch: true });
                    restoreBankScrollAnchor(savedScrollForRender);
                }
                return data;
            } catch (error) {
                console.warn('Question page load failed', error);
                bankRemoteError = error?.name === 'AbortError' ? 'request timeout' : (error?.message || 'load failed');
                if (render && $('bankScreen')?.classList.contains('active')) {
                    renderBank({ skipFetch: true, fallbackLocal: true });
                    restoreBankScrollAnchor(savedScrollForRender);
                }
                return null;
            } finally {
                clearTimeout(timeoutId);
                if (bankRemoteRequest === controllerKey) bankRemoteLoadingKey = '';
            }
        }

        function getBankIndex(subject) {
            const cacheKey = `${subject}:${questionBankRevision}:${backendQuestionIndex.revision || 'local'}:${state.customQuestions?.length || 0}`;
            if (bankIndexCache.has(cacheKey)) return bankIndexCache.get(cacheKey);
            const serverIndex = backendQuestionIndex.index?.[subject] || {};
            const index = getAllQuestions(subject).map(q => {
                const question = { ...q, subject: q.subject || subject };
                const meta = serverIndex[question.id] || null;
                const info = meta ? { topic: meta.topic, keywords: Array.isArray(meta.keywords) ? meta.keywords : [] } : classifyQuestion(question);
                const imported = meta ? !!meta.imported : (!!question.imported || question.source === 'auto-import' || question.source === 'manual-import' || question.meta?.imported);
                return {
                    q: question,
                    id: question.id,
                    key: meta?.key || questionKey(question),
                    info,
                    imported,
                    char: meta?.char || firstQuestionChar(question),
                    searchText: meta?.searchText || `${question.question} ${(question.options || []).join(' ')} ${info.topic} ${info.keywords.join(' ')}`.toLowerCase()
                };
            });
            bankIndexCache.set(cacheKey, index);
            return index;
        }

        function renderBankTopicFilter() {
            const wrap = $('bankTopicFilter');
            const color = getSubjectColor(state.bankSubject);
            wrap.style.setProperty('--subject-color', color);
            wrap.style.setProperty('--subject-bg', `${color}20`);
            const sections = bankTopicFilterSections(state.bankSubject);
            // 收集所有有效值用于过滤已选
            const allValues = new Set();
            sections.forEach(s => s.items.forEach(it => allValues.add(it.value)));
            state.bankTopicFilters = (Array.isArray(state.bankTopicFilters) ? state.bankTopicFilters : [])
                .filter(value => value !== 'all' && allValues.has(value));
            const selected = new Set(state.bankTopicFilters);
            const renderKey = `${state.bankSubject}:${questionBankRevision}:${sections.length}:${Array.from(selected).sort().join(',')}`;
            if (wrap.dataset.renderKey === renderKey) return;
            wrap.dataset.renderKey = renderKey;
            wrap.innerHTML = '';
            const title = document.createElement('div');
            title.className = 'topic-head';
            title.textContent = '题目筛选';
            wrap.appendChild(title);

            sections.forEach(section => {
                const secDiv = document.createElement('div');
                secDiv.className = 'bank-filter-section';
                const secTitle = document.createElement('div');
                secTitle.className = 'bank-filter-section-title';
                secTitle.textContent = section.title;
                secDiv.appendChild(secTitle);
                const chips = document.createElement('div');
                chips.className = 'bank-filter-chips';
                section.items.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'bank-topic-btn';
                    const isActive = opt.value === 'all' ? selected.size === 0 : selected.has(opt.value);
                    btn.classList.toggle('active', isActive);
                    btn.textContent = opt.label;
                    btn.addEventListener('click', () => {
                        if (opt.value === 'all') {
                            state.bankTopicFilters = [];
                        } else {
                            const next = new Set(state.bankTopicFilters);
                            if (next.has(opt.value)) next.delete(opt.value);
                            else next.add(opt.value);
                            state.bankTopicFilters = Array.from(next);
                        }
                        state.bankPage = 1;
                        bankRemoteError = '';
                        bankPageCache.clear();
                        renderBank();
                    });
                    chips.appendChild(btn);
                });
                secDiv.appendChild(chips);
                wrap.appendChild(secDiv);
            });
        }

        // 题库筛选分区数据：题型 / 难度 L1-L10 / 错题低正确率 / 默认导入题 / 其他题型
        function bankTopicFilterSections(subject) {
            const cacheKey = `${subject}:${questionBankRevision}:sections`;
            if (bankTopicCache.has(cacheKey)) return bankTopicCache.get(cacheKey);
            const sections = [
                {
                    title: '主要题型',
                    items: [
                        { value: 'all', label: '全部题目' },
                        { value: 'type:choice', label: '选择题' },
                        { value: 'type:fill', label: '填空题' }
                    ]
                },
                {
                    title: '难度',
                    items: Array.from({ length: 10 }, (_, i) => ({
                        value: `difficulty:${i + 1}`,
                        label: `L${i + 1}`
                    }))
                },
                {
                    title: '练习状态',
                    items: [
                        { value: 'practice:wrong', label: '错题' },
                        { value: 'practice:low', label: '低正确率' }
                    ]
                },
                {
                    title: '来源',
                    items: [
                        { value: 'imported:false', label: '默认题' },
                        { value: 'imported:true', label: '导入题' }
                    ]
                }
            ];

            // 其他题型：从题库中提取 topic / keyword / source
            const otherItems = [];
            const topicSet = new Set();
            const keywordSet = new Set();
            const sourceSet = new Set();
            getBankIndex(subject).forEach(item => {
                if (item.info?.topic) topicSet.add(item.info.topic);
                (item.info?.keywords || []).forEach(word => keywordSet.add(word));
                const source = item.q?.source || (item.imported ? 'manual-import' : 'default');
                if (source && source !== 'default') sourceSet.add(source);
            });
            Array.from(sourceSet).sort().slice(0, 12).forEach(source => otherItems.push({ value: `source:${source}`, label: source }));
            Array.from(topicSet).sort().slice(0, 40).forEach(topic => {
                if (!['选择题', '填空题'].includes(topic)) otherItems.push({ value: `topic:${topic}`, label: topic });
            });
            Array.from(keywordSet).sort().slice(0, 36).forEach(keyword => {
                if (!topicSet.has(keyword)) otherItems.push({ value: `keyword:${keyword}`, label: keyword });
            });
            if (otherItems.length) {
                sections.push({ title: '题型', items: otherItems });
            }

            // 如果后端提供了 filters，合并题型区
            if (backendQuestionIndex.filters?.[subject]?.length) {
                const backendOpts = backendQuestionIndex.filters[subject].filter(o => o.value !== 'all');
                if (backendOpts.length) {
                    sections[0].items = [{ value: 'all', label: '全部题目' }, ...backendOpts];
                }
            }

            normalizeBankFilterSections(sections);
            bankTopicCache.set(cacheKey, sections);
            return sections;
        }

        function normalizeBankFilterSections(sections) {
            if (!Array.isArray(sections) || !sections.length) return sections;
            const main = sections[0];
            const misplaced = [];
            main.items = (main.items || []).filter(item => {
                const value = String(item.value || '');
                if (value.startsWith('topic:') || value.startsWith('keyword:')) {
                    misplaced.push(item);
                    return false;
                }
                return true;
            });
            if (!misplaced.length) return sections;
            let topicSection = sections.find(section => (section.items || []).some(item => {
                const value = String(item.value || '');
                return value.startsWith('topic:') || value.startsWith('keyword:');
            }));
            if (!topicSection) {
                topicSection = { title: '\u9898\u578b', items: [] };
                sections.push(topicSection);
            }
            const seen = new Set((topicSection.items || []).map(item => item.value));
            misplaced.forEach(item => {
                if (!seen.has(item.value)) {
                    topicSection.items.push(item);
                    seen.add(item.value);
                }
            });
            return sections;
        }

        function getBankList() {
            ensureLocalQuestionBankReady();
            const search = state.bankSearch.trim().toLowerCase();
            const filterKey = (Array.isArray(state.bankTopicFilters) ? state.bankTopicFilters : []).slice().sort().join(',');
            const cacheKey = `${state.bankSubject}:${questionBankRevision}:${state.customQuestions?.length || 0}:${search}:${filterKey}`;
            if (bankListCache.has(cacheKey)) return bankListCache.get(cacheKey);
            let list = getBankIndex(state.bankSubject);
            const filters = Array.isArray(state.bankTopicFilters) ? state.bankTopicFilters : [];
            if (filters.length) {
                list = list.filter(item => filters.some(filter => {
                    if (filter === 'type:choice') return item.q.type === 'choice';
                    if (filter === 'type:fill') return item.q.type === 'fill';
                    if (filter.startsWith('topic:')) {
                        const value = filter.slice(6);
                        return item.info.topic === value || item.info.keywords.includes(value);
                    }
                    if (filter.startsWith('keyword:')) {
                        const value = filter.slice(8);
                        return item.info.keywords.includes(value) || item.info.topic === value;
                    }
                    if (filter.startsWith('difficulty:')) {
                        const value = filter.slice(11);
                        const range = value.match(/^(\d+)-(\d+)$/);
                        const difficulty = Number(item.q.difficulty || 5);
                        return range ? difficulty >= Number(range[1]) && difficulty <= Number(range[2]) : difficulty === Number(value);
                    }
                    if (filter === 'imported:true') return !!item.imported;
                    if (filter === 'imported:false') return !item.imported;
                    if (filter === 'practice:wrong') {
                        const key = item.key || questionKey(item.q);
                        return (state.questionAttemptCounts?.[key] || 0) > 0 && state.questionLastCorrect?.[key] === false;
                    }
                    if (filter === 'practice:low') {
                        const key = item.key || questionKey(item.q);
                        return (state.questionAttemptCounts?.[key] || 0) > 0 && bankItemScore(item) < 50;
                    }
                    if (filter.startsWith('source:')) {
                        const value = filter.slice(7);
                        return String(item.q.source || (item.imported ? 'manual-import' : 'default')) === value;
                    }
                    return false;
                }));
            }
            if (search) list = list.filter(item => item.searchText.includes(search));
            bankListCache.set(cacheKey, list);
            return list;
        }

        function bankPageKey(list, page, pageSize) {
            const filterKey = (Array.isArray(state.bankTopicFilters) ? state.bankTopicFilters : []).slice().sort().join(',');
            return `${state.bankSubject}:${questionBankRevision}:${state.customQuestions?.length || 0}:${state.bankSearch.trim().toLowerCase()}:${filterKey}:${page}:${pageSize}:${state.bankDeleteMode}:${state.bankDeleteSelected.join(',')}`;
        }

        function questionScoreColor(score) {
            const value = Math.max(0, Math.min(100, Number(score) || 0));
            const color = masteryLevel(value / 100, 1).color;
            return { bg: color, ink: '#FFFFFF' };
        }

        function bankItemScore(item) {
            const q = item.q;
            const key = item.key || questionKey(q);
            if (state.questionAccuracyScores?.[key] !== undefined) {
                return Math.max(0, Math.min(100, Number(state.questionAccuracyScores[key]) || 0));
            }
            if (item.status && item.status.score !== undefined) {
                return Math.max(0, Math.min(100, Number(item.status.score) || 0));
            }
            return Math.max(0, Math.min(100, Number(state.questionAccuracyScores?.[key] || 0)));
        }

        function bankItemAnswered(item) {
            const key = item.key || questionKey(item.q);
            if (state.questionAttemptCounts?.[key] > 0) return true;
            if (state.questionAccuracyScores?.[key] !== undefined) return true;
            if (item.status && item.status.count > 0) return true;
            return false;
        }

        function isDeletableQuestion(item) {
            if (item.imported) return true;
            const q = item.q;
            if (q.source && q.source !== 'default' && q.source !== 'builtin') return true;
            if (q.meta?.imported || q.meta?.source === 'manual-add' || q.meta?.source === 'auto-import') return true;
            return false;
        }

        function bankButtonHtml(item) {
            const q = item.q;
            const subject = q.subject || state.bankSubject || state.subject || '';
            const subjectColor = getSubjectColor(subject);
            const selected = state.bankDeleteSelected.includes(item.key);
            const star = item.imported ? '<span class="import-bar"></span>' : '';
            const score = bankItemScore(item);
            const answered = bankItemAnswered(item);
            const diffLabel = `L${q.difficulty || '-'}`;
            const title = `${escapeHtml(moveLeadingQuestionTag(q.question))} (${diffLabel})`;
            if (!answered) {
                return `<button class="bank-btn${selected ? ' selected' : ''}" data-key="${escapeHtml(item.key)}" style="--subject-color:${subjectColor}" title="${title}"><span class="diff">${diffLabel}</span><span class="char">${escapeHtml(item.char)}</span>${star}</button>`;
            }
            if (score === 0) {
                return `<button class="bank-btn status-zero${selected ? ' selected' : ''}" data-key="${escapeHtml(item.key)}" style="--subject-color:${subjectColor}" title="${title}"><span class="diff">${diffLabel}</span><span class="char">${escapeHtml(item.char)}</span>${star}</button>`;
            }
            const color = questionScoreColor(score);
            return `<button class="bank-btn status-score${selected ? ' selected' : ''}" data-key="${escapeHtml(item.key)}" style="--subject-color:${subjectColor};--score-bg:${color.bg};--score-ink:${color.ink}" title="${title}"><span class="diff">${diffLabel}</span><span class="char">${escapeHtml(item.char)}</span>${star}</button>`;
        }

        function renderBank(options = {}) {
            $$('.bank-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.bankSubject === state.bankSubject));
            renderBankTopicFilter();
            const activeMeta = currentBankRemoteMeta();
            const pageSize = Number(activeMeta?.pageSize || bankPageSize());
            const remoteKey = bankRemoteKey(state.bankPage);
            let pageItems = bankRemotePageCache.get(remoteKey);
            let pages = Math.max(1, Number(activeMeta?.pages || 1));
            let total = Number(activeMeta?.total || 0);
            let list = null;
            const useLocalPaging = options.fallbackLocal || isLocalFile;
            const canLoadRemote = !useLocalPaging;
            const isLoading = bankRemoteLoadingKey === remoteKey;
            if (useLocalPaging) {
                list = getBankList();
                pages = Math.max(1, Math.ceil(list.length / pageSize));
                total = list.length;
                state.bankPage = Math.max(1, Math.min(state.bankPage, pages));
                const start = (state.bankPage - 1) * pageSize;
                pageItems = list.slice(start, start + pageSize);
            }
            if (!pageItems && canLoadRemote) {
                pages = Math.max(1, Number(activeMeta?.pages || 1));
                total = Number(activeMeta?.total || 0);
            }
            state.bankPage = Math.min(state.bankPage, pages);
            $('bankInfo').textContent = `${state.bankSubject || 'subject'} / \u5171 ${total || '...'} \u9898`;
            if (!pageItems) {
                if (bankRemoteError && !isLoading) {
                    renderBank({ ...options, fallbackLocal: true, skipFetch: true });
                    const status = $('bankSearchStatus');
                    if (status) status.textContent = '\u540e\u7aef\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u5df2\u5207\u6362\u5230\u672c\u5730\u9898\u5e93\u3002';
                    return;
                } else {
                    $('bankGrid').innerHTML = '<div class="empty-fav">\u6b63\u5728\u52a0\u8f7d\u5f53\u524d\u9875\uff0c\u8bf7\u7a0d\u5019...</div>';
                }
                if (!options.skipFetch && !isLoading) loadBankRemotePages(state.bankPage, { render: true, force: true, scrollAnchor: options.scrollAnchor || null });
            } else {
                $('bankGrid').style.minHeight = '';
                const pageKey = `${useLocalPaging ? 'local' : remoteKey}:${state.bankPage}:${state.bankDeleteMode}:${state.bankDeleteSelected.join(',')}:${questionScoreRevision}`;
                if (!bankPageCache.has(pageKey)) {
                    bankPageCache.set(pageKey, pageItems.map(bankButtonHtml).join(''));
                }
                $('bankGrid').innerHTML = bankPageCache.get(pageKey);
            }
            $('bankGrid').onclick = event => {
                const btn = event.target.closest('.bank-btn');
                if (!btn) return;
                const currentItems = useLocalPaging ? (pageItems || list || []) : (bankRemotePageCache.get(bankRemoteKey(state.bankPage)) || pageItems || list || []);
                const item = currentItems.find(x => x.key === btn.dataset.key);
                if (!item) return;
                currentBankQuestion = item.q;
                renderPreview($('bankPreview'), currentBankQuestion, 'bank');
                if (state.bankDeleteMode) {
                    if (!isDeletableQuestion(item)) return;
                    const selected = new Set(state.bankDeleteSelected);
                    if (selected.has(item.key)) selected.delete(item.key);
                    else selected.add(item.key);
                    state.bankDeleteSelected = Array.from(selected);
                    bankPageCache.clear();
                    renderBank();
                    return;
                }
            };
            $('bankDeleteTools').classList.toggle('show', !!state.bankDeleteMode);
            $('deleteImportedStatus').textContent = state.bankDeleteMode ? `\u5df2\u9009 ${state.bankDeleteSelected.length} \u9898` : '';
            renderPagination(pages);
        }
        function renderPagination(pages) {
            const wrap = $('bankPagination');
            wrap.innerHTML = '';
            const go = page => {
                const anchor = captureBankScrollAnchor();
                const grid = $('bankGrid');
                if (grid && !isLocalFile) grid.style.minHeight = `${Math.max(grid.offsetHeight || 0, window.innerHeight)}px`;
                state.bankPage = Math.max(1, Math.min(pages, page));
                renderBank({ scrollAnchor: anchor });
                restoreBankScrollAnchor(anchor);
            };
            const addButton = (label, page, disabled = false, active = false) => {
                const btn = document.createElement('button');
                btn.textContent = label;
                btn.disabled = disabled;
                btn.classList.toggle('active', active);
                btn.addEventListener('click', () => go(page));
                wrap.appendChild(btn);
            };
            addButton('<<', 1, state.bankPage === 1);
            addButton('<', state.bankPage - 1, state.bankPage === 1);
            for (let page = Math.max(1, state.bankPage - 3); page <= Math.min(pages, state.bankPage + 3); page++) {
                addButton(String(page), page, false, page === state.bankPage);
            }
            addButton('>', state.bankPage + 1, state.bankPage === pages);
            addButton('>>', pages, state.bankPage === pages);
            const jump = document.createElement('span');
            jump.className = 'jump';
            jump.innerHTML = `\u8df3\u8f6c\u5230 <input type="number" min="1" max="${pages}" id="bankPageJump" value="${state.bankPage}"> \u9875 <button id="bankPageJumpBtn">Go</button>`;
            wrap.appendChild(jump);
            const error = document.createElement('div');
            error.className = 'page-error';
            error.id = 'bankPageError';
            wrap.appendChild(error);
            const submit = () => {
                const value = Number($('bankPageJump').value);
                if (!Number.isInteger(value) || value < 1 || value > pages) {
                    $('bankPageError').textContent = `\u8bf7\u8f93\u5165 1 \u5230 ${pages} \u4e4b\u95f4\u7684\u9875\u7801\u3002`;
                    return;
                }
                go(value);
            };
            $('bankPageJumpBtn').addEventListener('click', submit);
            $('bankPageJump').addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
        }
        // Task 6: 通用雷达分页器（仿题库 renderPagination：含跳页与搜索页数）
        function renderRadarPagination(wrapId, currentPage, pages, onPageChange) {
            const wrap = $(wrapId);
            if (!wrap) return;
            wrap.innerHTML = '';
            // 单页或无结果时隐藏分页器
            if (pages <= 1) { wrap.hidden = true; return; }
            wrap.hidden = false;
            const go = page => { if (typeof onPageChange === 'function') onPageChange(Math.max(1, Math.min(pages, page))); };
            const addButton = (label, page, disabled = false, active = false) => {
                const btn = document.createElement('button');
                btn.textContent = label;
                btn.disabled = disabled;
                btn.classList.toggle('active', active);
                btn.addEventListener('click', () => go(page));
                wrap.appendChild(btn);
            };
            addButton('<<', 1, currentPage === 1);
            addButton('<', currentPage - 1, currentPage === 1);
            for (let p = Math.max(1, currentPage - 3); p <= Math.min(pages, currentPage + 3); p++) {
                addButton(String(p), p, false, p === currentPage);
            }
            addButton('>', currentPage + 1, currentPage === pages);
            addButton('>>', pages, currentPage === pages);
            const jump = document.createElement('span');
            jump.className = 'jump';
            jump.innerHTML = `跳转到 <input type="number" min="1" max="${pages}" value="${currentPage}"> 页 <button type="button">Go</button>`;
            wrap.appendChild(jump);
            const error = document.createElement('div');
            error.className = 'page-error';
            wrap.appendChild(error);
            const inputEl = jump.querySelector('input');
            const btnEl = jump.querySelector('button');
            const submit = () => {
                const value = Number(inputEl.value);
                if (!Number.isInteger(value) || value < 1 || value > pages) {
                    error.textContent = `请输入 1 到 ${pages} 之间的页码。`;
                    return;
                }
                error.textContent = '';
                go(value);
            };
            btnEl.addEventListener('click', submit);
            inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
        }

        async function autoTagQuestionBank() {
            const btn = $('autoTagBtn');
            if (!btn) return;
            const oldText = btn.textContent;
            btn.disabled = true;
            btn.textContent = '分类中...';
            try {
                if (settings.useLocalModel) {
                    const updated = await autoTagQuestionBankLocal(state.bankSubject);
                    if (updated > 0) {
                        clearQuestionRuntimeCache();
                        saveData();
                        renderBank();
                        $('bankSearchStatus').className = 'bank-search-status';
                        $('bankSearchStatus').textContent = `AI \u672c\u5730\u5206\u7c7b\u5b8c\u6210\uff0c\u66f4\u65b0 ${updated} \u9053\u9898\u3002`;
                        return;
                    }
                }
                const res = await fetch(apiUrl('/api/auto-tag'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ai: { provider: settings.aiProvider, baseUrl: settings.aiBaseUrl, apiKey: settings.aiApiKey, model: settings.aiModel }
                    })
                });
                const data = await res.json();
                if (!data.ok) throw new Error(data.error || 'auto-tag failed');
                $('bankSearchStatus').className = 'bank-search-status';
                $('bankSearchStatus').textContent = `AI 自动分类完成，更新 ${data.updated || 0} 道题。`;
                await refreshQuestionBankFromBackend({ render: true });
            } catch (error) {
                $('bankSearchStatus').className = 'bank-search-status error';
                $('bankSearchStatus').textContent = 'AI 自动分类失败，请确认后端服务和 AI 设置可用。';
            } finally {
                btn.disabled = false;
                btn.textContent = oldText;
            }
        }

        async function autoTagQuestionBankLocal(subject) {
            const list = getAllQuestions(subject).slice(0, 80);
            let updated = 0;
            for (const q of list) {
                const fallback = classifyQuestion({ ...q, subject });
                if (Array.isArray(q.meta?.keywords) && q.meta.keywords.length && q.meta.knowledge_path?.length) continue;
                const prompt = [
                    '\u8bf7\u7ed9\u6570\u5b66\u9898\u5206\u7c7b\uff0c\u53ea\u8f93\u51fa JSON {"topic":"","keywords":[""],"difficulty":1}\u3002',
                    `\u5b66\u79d1\uff1a${getSubjectName(subject)}`,
                    `\u9898\u5e72\uff1a${q.question}`,
                    (q.options || []).length ? `\u9009\u9879\uff1a${q.options.join('\u3001')}` : '',
                    `\u5019\u9009\u9898\u578b\uff1a${(topicRules[subject] || []).map(pair => pair[0]).join('\u3001')}`
                ].filter(Boolean).join('\n');
                const parsed = await callConfiguredLocalJson(prompt);
                const topic = sanitizeMathTopic(parsed?.topic || fallback.topic, subject, q.type);
                const keywords = sanitizeMathKeywords(parsed?.keywords || fallback.keywords, subject, `${q.question} ${(q.options || []).join(' ')}`, 5, topic);
                q.meta = {
                    ...(q.meta || {}),
                    type: topic,
                    knowledge_path: [getSubjectName(subject), topic],
                    keywords: keywords.length ? keywords : fallback.keywords,
                    difficulty: Math.max(1, Math.min(10, Number(parsed?.difficulty || q.difficulty || 5)))
                };
                updated++;
            }
            return updated;
        }

        function setBankDeleteMode(active) {
            state.bankDeleteMode = !!active;
            state.bankDeleteSelected = [];
            bankPageCache.clear();
            renderBank();
        }

        async function deleteSelectedImportedQuestions() {
            if (!state.bankDeleteSelected.length) return;
            const selectedKeys = new Set(state.bankDeleteSelected);
            const ids = state.bankDeleteSelected.map(key => {
                const parts = key.split('::');
                return parts.slice(1).join('::');
            });
            try {
                const res = await fetch(apiUrl(`/api/imported-questions?ids=${encodeURIComponent(ids.join(','))}`), { method: 'DELETE' });
                const data = await res.json();
                if (!data.ok) throw new Error(data.error || 'delete failed');
                $('deleteImportedStatus').textContent = `已删除 ${data.deleted || 0} 题`;
                state.customQuestions = (state.customQuestions || []).filter(q => !ids.includes(q.id));
                sessionStorage.removeItem(questionBankCacheKey);
                clearQuestionRuntimeCache();
                state.bankDeleteSelected = [];
                await refreshQuestionBankFromBackend({ render: true, force: true });
                if (currentBankQuestion) {
                    const currentKey = questionKey(currentBankQuestion);
                    if (selectedKeys.has(currentKey) || ids.includes(currentBankQuestion.id)) resetBankPreview();
                }
                renderBank();
            } catch (error) {
                $('deleteImportedStatus').textContent = '删除失败，请确认后端服务已启动。';
            }
        }

        async function clearAllImportedQuestions() {
            if (!confirm('确定移除所有添加/导入的题目吗？默认题目不会被删除。')) return;
            try {
                const res = await fetch(apiUrl('/api/imported-questions?all=1'), { method: 'DELETE' });
                const data = await res.json();
                if (!data.ok) throw new Error(data.error || 'clear failed');
                state.customQuestions = [];
                sessionStorage.removeItem(questionBankCacheKey);
                clearQuestionRuntimeCache();
                await refreshQuestionBankFromBackend({ render: true, force: true });
                saveData();
                alert(`已移除 ${data.deleted || 0} 道添加题。`);
            } catch (error) {
                alert('移除失败，请确认后端服务已启动。');
            }
        }

        function addCustomQuestion() {
            const subject = getSelectedValue('bankAddSubject', 'calculus');
            const type = getSelectedValue('bankAddType', 'choice');
            const question = $('bankAddQuestion').value.trim();
            const explanation = $('bankAddExplanation').value.trim();
            const difficulty = Number($('bankAddDifficulty').value);
            if (!question) return;
            const q = { id: `u${Date.now()}`, subject, difficulty, type, question, explanation, imported: true, source: 'manual-import', meta: { imported: true, source: 'manual-import' } };
            if (type === 'choice') {
                q.options = $('bankAddOptions').value.split(',').map(x => x.trim()).filter(Boolean);
                q.answer = Number($('bankAddAnswer').value || 0);
                if (q.options.length < 2) return;
            } else {
                q.answer = $('bankAddAnswer').value.trim();
                if (!q.answer) return;
            }
            state.customQuestions.push(q);
            state.achievementFlags.firstImport = true;
            syncQuestionToServer(q);
            Object.keys(questionListCache).forEach(key => { if (key.startsWith(`${subject}:`)) delete questionListCache[key]; });
            $('addQuestionModal').classList.remove('show');
            state.bankSubject = subject;
            state.bankPage = 1;
            saveData();
            renderBank();
        }

        function normalizeImportedQuestion(raw, subject = state.bankSubject) {
            const q = {
                id: `imp${Date.now()}${Math.floor(Math.random() * 100000)}`,
                subject: raw.subject || subject,
                difficulty: Math.max(1, Math.min(10, Number(raw.difficulty || raw.level || 5))),
                type: raw.type === 'fill' || raw.type === '\u586b\u7a7a\u9898' ? 'fill' : 'choice',
                question: String(raw.question || raw.stem || raw['题目'] || '').trim(),
                explanation: String(raw.explanation || raw.analysis || raw['解析'] || ''),
                imported: true,
                source: raw.source || 'manual-import',
                meta: { ...(raw.meta || {}), imported: true, source: raw.source || 'manual-import' }
            };
            if (!q.question) return null;
            const rawOptions = raw.options || raw['选项'] || '';
            const options = Array.isArray(rawOptions)
                ? rawOptions.map(String)
                : String(rawOptions).split(/[,\n;；|]+/).map(x => x.replace(/^[A-Da-d][.．、]\s*/, '').trim()).filter(Boolean);
            const ans = raw.answer ?? raw['\u7b54\u6848'] ?? raw.correct ?? '';
            if (q.type === 'choice' && options.length >= 2) {
                q.options = options.slice(0, 6);
                if (/^[A-Da-d]$/.test(String(ans).trim())) q.answer = String(ans).trim().toUpperCase().charCodeAt(0) - 65;
                else q.answer = Math.max(0, Math.min(q.options.length - 1, Number(ans) || 0));
            } else {
                q.type = 'fill';
                q.answer = String(ans).trim();
            }
            if (!String(q.answer).trim() && q.type === 'fill') return null;
            return q;
        }

        function parseDelimitedLine(line) {
            const parts = line.split('|').map(x => x.trim());
            if (parts.length < 2) return null;
            return {
                question: parts[0],
                answer: parts[1],
                explanation: parts[2] || '',
                difficulty: parts[3] || 5,
                type: parts[4] || (/[A-Da-d][.\u3002\uFF0E\u3001]/.test(parts[0]) ? 'choice' : 'fill')
            };
        }

        function parseImportedQuestions(text, subject = state.bankSubject) {
            const clean = String(text || '').trim();
            if (!clean) return [];
            try {
                const data = JSON.parse(clean);
                const arr = Array.isArray(data) ? data : (Array.isArray(data.questions) ? data.questions : []);
                return arr.map(item => normalizeImportedQuestion(item, subject)).filter(Boolean);
            } catch (_) {}

            const lines = clean.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
            const delimited = lines.map(parseDelimitedLine).filter(Boolean);
            if (delimited.length) return delimited.map(item => normalizeImportedQuestion(item, subject)).filter(Boolean);

            const blocks = clean.split(/\n\s*\n+/).map(x => x.trim()).filter(Boolean);
            return blocks.map(block => {
                const lines = block.split(/\n/).map(x => x.trim()).filter(Boolean);
            const question = (lines.find(line => /^(\u9898\u76ee|\u95ee\u9898|Q)[:\uff1a]/i.test(line))?.replace(/^(\u9898\u76ee|\u95ee\u9898|Q)[:\uff1a]\s*/i, '') || lines[0] || '').trim();
            const answer = (lines.find(line => /^(\u7b54\u6848|Answer)[:\uff1a]/i.test(line))?.replace(/^(\u7b54\u6848|Answer)[:\uff1a]\s*/i, '') || '').trim();
            const explanation = (lines.find(line => /^(\u89e3\u6790|Explanation)[:\uff1a]/i.test(line))?.replace(/^(\u89e3\u6790|Explanation)[:\uff1a]\s*/i, '') || '').trim();
                const optionMatches = lines.filter(line => /^[A-Da-d][.．、]/.test(line)).map(line => line.replace(/^[A-Da-d][.．、]\s*/, '').trim());
                return normalizeImportedQuestion({ question, answer, explanation, options: optionMatches, type: optionMatches.length ? 'choice' : 'fill' }, subject);
            }).filter(Boolean);
        }

        function importQuestions(questions) {
            const unique = [];
            questions.forEach(q => {
                const existing = getAllQuestions(q.subject).some(item => normalizeStem(item.question) === normalizeStem(q.question) || stemSimilarity(item.question, q.question) > 0.8);
                const queued = unique.some(item => normalizeStem(item.question) === normalizeStem(q.question) || stemSimilarity(item.question, q.question) > 0.8);
                if (!existing && !queued) unique.push(q);
            });
            state.customQuestions.push(...unique);
            if (unique.length) state.achievementFlags.firstImport = true;
            unique.forEach(syncQuestionToServer);
            unique.forEach(q => Object.keys(questionListCache).forEach(key => { if (key.startsWith(`${q.subject}:`)) delete questionListCache[key]; }));
            saveData();
            renderBank();
            return unique.length;
        }

        function renderAutoImportCandidates() {
            const wrap = $('autoImportResults');
            if (!wrap) return;
            wrap.innerHTML = autoImportCandidates.map(q => {
                const key = q.id;
                const selected = autoImportSelected.has(key);
                return `<button class="auto-candidate${selected ? ' selected' : ''}" data-id="${escapeHtml(key)}" style="--subject-color:${getSubjectColor(q.subject)}"><span>L${q.difficulty || 5}</span><b>${escapeHtml(firstQuestionChar(q))}</b></button>`;
            }).join('') || '<div class="preview-empty">暂无候选题</div>';
            wrap.onclick = event => {
                const btn = event.target.closest('.auto-candidate');
                if (!btn) return;
                const id = btn.dataset.id;
                if (autoImportSelected.has(id)) autoImportSelected.delete(id);
                else autoImportSelected.add(id);
                const q = autoImportCandidates.find(item => item.id === id);
                if (q) renderAutoImportPreview(q);
                renderAutoImportCandidates();
            };
        }

        function renderAutoImportPreview(q) {
            const wrap = $('autoImportPreview');
            if (!wrap) return;
            if (!q) {
                wrap.innerHTML = '<div class="preview-empty">点击候选题预览内容</div>';
                return;
            }
            const typeLabel = q.type === 'choice' ? '\u9009\u62e9\u9898' : '\u586b\u7a7a\u9898';
            const difficulty = q.difficulty || 5;
            const options = q.type === 'choice' && Array.isArray(q.options)
                ? `<div class="preview-options" style="margin:8px 0;">${q.options.map((opt, i) => `<div class="preview-option" style="padding:4px 0;font-size:13px;">${String.fromCharCode(65 + i)}. ${htmlWithMath(opt)}</div>`).join('')}</div>`
                : '';
            const answerText = answerDisplayHtml(q);
            const explanation = q.explanation ? `<div style="margin-top:8px;font-size:13px;color:var(--ink-light);line-height:1.6;">${htmlWithMath(q.explanation)}</div>` : '';
            wrap.innerHTML = `
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">
                    <span style="padding:2px 8px;border-radius:8px;background:var(--ocean-soft);color:var(--ocean);font-size:12px;font-weight:800;">${escapeHtml(typeLabel)}</span>
                    <span style="padding:2px 8px;border-radius:8px;background:#F1F5F9;color:var(--ink);font-size:12px;font-weight:800;">难度 L${escapeHtml(String(difficulty))}</span>
                </div>
                <div style="font-size:14px;font-weight:800;line-height:1.6;margin-bottom:6px;">${htmlWithMath(moveLeadingQuestionTag(q.question || ''))}</div>
                ${options}
                <div style="margin-top:8px;font-size:13px;font-weight:800;color:var(--mint);">答案：${answerText}</div>
                ${explanation}
            `;
            renderLatex(wrap);
        }

        async function searchAutoImportQuestions() {
            const keyword = $('autoImportKeyword').value.trim();
            $('autoImportStatus').textContent = '正在搜索并归类候选题...';
            try {
                if (settings.useLocalModel) {
                    const localQuestions = await generateAutoImportLocal(state.bankSubject, keyword);
                    if (localQuestions.length) {
                        autoImportCandidates = localQuestions;
                        autoImportSelected.clear();
                        $('autoImportStatus').textContent = `\u672c\u5730\u6a21\u578b\u751f\u6210 ${autoImportCandidates.length} \u9053\u5019\u9009\u9898\u3002`;
                        renderAutoImportCandidates();
                        return;
                    }
                }
                const res = await fetch(apiUrl('/api/auto-import/search'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subject: state.bankSubject,
                        keyword,
                        ai: { provider: settings.aiProvider, baseUrl: settings.aiBaseUrl, apiKey: settings.aiApiKey, model: settings.aiModel }
                    })
                });
                const data = await res.json();
                if (!data.ok) throw new Error(data.error || 'search failed');
                autoImportCandidates = data.questions || [];
                autoImportSelected.clear();
                $('autoImportStatus').textContent = `找到 ${autoImportCandidates.length} 道候选题。`;
                renderAutoImportCandidates();
            } catch (error) {
                $('autoImportStatus').textContent = '自动搜索失败，无法连接后端或接口配置不可用。';
            }
        }

        async function generateAutoImportLocal(subject, keyword) {
            const prompt = [
                '\u8bf7\u751f\u6210\u6570\u5b66\u9898\u76ee\u5019\u9009\uff0c\u53ea\u8f93\u51fa JSON {"questions":[{"type":"choice|fill","question":"","options":[],"answer":"","explanation":"","difficulty":5,"topic":"","keywords":[""]}]}',
                `\u5b66\u79d1\uff1a${getSubjectName(subject)}`,
                `\u5173\u952e\u8bcd\uff1a${keyword || '\u7efc\u5408\u7ec3\u4e60'}`,
                '\u8981\u6c42\uff1a\u9898\u76ee\u4e0d\u8981\u4e0e\u5e38\u89c1\u6a21\u677f\u5b8c\u5168\u76f8\u540c\uff0c\u7ed9\u51fa\u53ef\u4ee5\u6e32\u67d3\u7684 LaTeX\u3002'
            ].join('\n');
            const parsed = await callConfiguredLocalJson(prompt);
            const raw = Array.isArray(parsed?.questions) ? parsed.questions : [];
            return raw.slice(0, 20).map((q, index) => {
                const normalized = normalizeImportedQuestion({
                    ...q,
                    id: `local-ai-${subject}-${Date.now()}-${index}`,
                    subject,
                    source: 'local-model-import',
                    imported: true,
                    meta: {
                        ...(q.meta || {}),
                        imported: true,
                        source: 'local-model-import',
                        type: sanitizeMathTopic(q.topic || q.meta?.type, subject, q.type),
                        keywords: sanitizeMathKeywords(q.keywords || q.meta?.keywords || [], subject, q.question || '', 5)
                    }
                });
                return { ...normalized, subject };
            }).filter(q => q.question && q.answer !== undefined);
        }

        async function confirmAutoImportQuestions() {
            const questions = autoImportCandidates.filter(q => autoImportSelected.has(q.id));
            if (!questions.length) {
                $('autoImportStatus').textContent = '请先选择要导入的题。';
                return;
            }
            try {
                const res = await fetch(apiUrl('/api/imported-questions'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ questions })
                });
                const data = await res.json();
                if (!data.ok) throw new Error(data.error || 'import failed');
                $('autoImportStatus').textContent = `已导入 ${data.imported || 0} 道题。`;
                sessionStorage.removeItem(questionBankCacheKey);
                clearQuestionRuntimeCache();
                await refreshQuestionBankFromBackend({ render: true, force: true });
            } catch (error) {
                $('autoImportStatus').textContent = '导入失败，请确认后端服务已启动。';
            }
        }

        async function readImportFile(file) {
            if (!file) return '';
            return await file.text();
        }

        async function fetchWebText() {
            const url = $('webExtractUrl').value.trim();
            if (!url) {
                $('importError').textContent = '请输入网页地址，或直接粘贴网页正文。';
                $('importError').style.display = 'block';
                return;
            }
            try {
                const res = await fetch(url);
                const html = await res.text();
                const text = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '\n').replace(/\n{3,}/g, '\n\n');
                $('importTextInput').value = text.trim();
                $('importError').style.display = 'none';
            } catch (error) {
                $('importError').textContent = '浏览器无法跨域读取该网页。请复制网页正文粘贴到下方文本框后再提取。';
                $('importError').style.display = 'block';
            }
        }

        async function confirmImportQuestions() {
            const fileText = await readImportFile($('importFileInput').files[0]);
            const text = `${fileText}\n\n${$('importTextInput').value}`;
            const questions = parseImportedQuestions(text, state.bankSubject);
            if (!questions.length) {
                $('importError').textContent = '没有识别到可导入题目。建议使用“题目 | 答案 | 解析 | 难度 | 题型”格式。';
                $('importError').style.display = 'block';
                return;
            }
            const count = importQuestions(questions);
            $('importQuestionModal').classList.remove('show');
            $('bankSearchStatus').className = 'bank-search-status';
            $('bankSearchStatus').textContent = `已导入 ${count} 道新题，自动跳过重复或相似度过高的题。`;
        }

        function ensureSettingsExtraControls() {
            if (!$('keyboardCursorStepRange')) {
                const keyboardGroup = $('keyboardBindings')?.closest('.settings-group');
                if (keyboardGroup) {
                    const cursorGroup = document.createElement('div');
                    cursorGroup.className = 'settings-group';
                    cursorGroup.dataset.settingsCategory = 'keyboard';
                    cursorGroup.innerHTML = '<label>\u5149\u6807\u79fb\u52a8\u7075\u654f\u5ea6</label><div class="settings-row"><input type="range" id="keyboardCursorStepRange" min="8" max="80" step="4" value="24"><span class="range-value" id="keyboardCursorStepValue">24 px</span></div><p class="hint">Shift + \u65b9\u5411\u952e\u79fb\u52a8\u9875\u9762\u5185\u9f20\u6807\u5149\u6807\u7684\u6b65\u957f\u3002</p>';
                    keyboardGroup.before(cursorGroup);
                    $('keyboardCursorStepRange')?.addEventListener('input', e => {
                        settings.keyboard.cursorStep = Number(e.target.value);
                        applySettings();
                        saveData();
                    });
                }
            }
            if ($('homeConfirmToggle') && $('resetSettingsBtn') && $('replayTutorialBtn') && !$('calculatorFullExpandToggle')) {
                const calcGroup = document.createElement('div');
                calcGroup.className = 'settings-group';
                calcGroup.dataset.settingsCategory = 'questions';
                calcGroup.innerHTML = '<label>\u8ba1\u7b97\u5668\u663e\u793a\u65b9\u5f0f</label><button class="theme-toggle" id="calculatorFullExpandToggle">\u9700\u8981\u6eda\u52a8\u663e\u793a</button><p class="hint">\u5b8c\u5168\u5c55\u5f00\u65f6\u4f1a\u5c3d\u91cf\u663e\u793a\u5168\u90e8\u6309\u952e\uff0c\u4e0d\u5728\u8ba1\u7b97\u5668\u5185\u90e8\u6eda\u52a8\u3002</p>';
                $('closeSettings')?.parentElement?.before(calcGroup);
                $('calculatorFullExpandToggle')?.addEventListener('click', () => {
                    settings.calculatorFullExpand = !settings.calculatorFullExpand;
                    applySettings();
                    saveData();
                    window.resetCalculatorPosition?.();
                });
                return;
            }
            if ($('homeConfirmToggle') && $('resetSettingsBtn') && $('replayTutorialBtn') && $('calculatorFullExpandToggle')) return;
            const actions = $('closeSettings')?.parentElement;
            if (!actions) return;
            const homeGroup = document.createElement('div');
            homeGroup.className = 'settings-group';
                homeGroup.innerHTML = '<label>\u7b54\u9898\u4e2d\u8fd4\u56de\u9996\u9875</label><button class=\"theme-toggle active\" id=\"homeConfirmToggle\">\u8fd4\u56de\u524d\u63d0\u793a</button>';
            const resetGroup = document.createElement('div');
            resetGroup.className = 'settings-group';
            resetGroup.innerHTML = '<label>\u9ed8\u8ba4\u8bbe\u7f6e</label><button class="theme-toggle" id="resetSettingsBtn">\u8fd8\u539f\u9ed8\u8ba4\u8bbe\u7f6e</button>';
            const tutorialGroup = document.createElement('div');
            tutorialGroup.className = 'settings-group';
            tutorialGroup.innerHTML = '<label>新手教程</label><button class="theme-toggle" id="replayTutorialBtn">重新播放教程</button>';
            const calcGroup = document.createElement('div');
            calcGroup.className = 'settings-group';
            calcGroup.dataset.settingsCategory = 'questions';
            calcGroup.innerHTML = '<label>\u8ba1\u7b97\u5668\u663e\u793a\u65b9\u5f0f</label><button class="theme-toggle" id="calculatorFullExpandToggle">\u9700\u8981\u6eda\u52a8\u663e\u793a</button><p class="hint">\u5b8c\u5168\u5c55\u5f00\u65f6\u4f1a\u5c3d\u91cf\u663e\u793a\u5168\u90e8\u6309\u952e\uff0c\u4e0d\u5728\u8ba1\u7b97\u5668\u5185\u90e8\u6eda\u52a8\u3002</p>';
            actions.before(homeGroup, resetGroup, tutorialGroup, calcGroup);
            $('homeConfirmToggle').addEventListener('click', () => {
                settings.homeConfirm = !settings.homeConfirm;
                applySettings();
                saveData();
            });
            $('resetSettingsBtn').addEventListener('click', () => {
                Object.assign(settings, defaultSettings);
                applySettings();
                saveData();
            });
            $('replayTutorialBtn').addEventListener('click', () => {
                $('settingsModal').classList.remove('show');
                showTutorial();
            });
            $('calculatorFullExpandToggle').addEventListener('click', () => {
                settings.calculatorFullExpand = !settings.calculatorFullExpand;
                applySettings();
                saveData();
                window.resetCalculatorPosition?.();
            });
        }

        const aiProviders = [
            { id: 'auto', name: '自动识别', icon: 'ai', baseUrl: '', models: [] },
            { id: 'custom', name: '自定义', icon: 'custom', baseUrl: '', models: [] },
            { id: 'openai', name: 'OpenAI', icon: 'openai', baseUrl: 'https://api.openai.com/v1/chat/completions', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
            { id: 'anthropic', name: 'Anthropic', icon: 'anthropic', baseUrl: 'https://api.anthropic.com/v1/messages', models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'] },
            { id: 'gemini', name: 'Gemini', icon: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models', models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'] },
            { id: 'deepseek', name: 'DeepSeek', icon: 'deepseek', baseUrl: 'https://api.deepseek.com/v1/chat/completions', models: ['deepseek-chat', 'deepseek-reasoner'] },
            { id: 'doubao', name: '豆包', icon: 'doubao', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', models: ['doubao-pro-256k', 'doubao-pro-32k', 'doubao-lite-32k', 'doubao-seed-2.1-pro', 'doubao-seed-2.1-turbo'] },
            { id: 'kimi', name: 'Kimi', icon: 'kimi', baseUrl: 'https://api.moonshot.cn/v1/chat/completions', models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k', 'kimi-k2.5'] },
            { id: 'glm', name: '智谱GLM', icon: 'glm', baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', models: ['glm-4', 'glm-4-flash', 'glm-4v', 'glm-4.5'] },
            { id: 'minimax', name: 'MiniMax', icon: 'minimax', baseUrl: 'https://api.minimax.chat/v1/text/chatcompletion_v2', models: ['abab6.5-chat', 'abab6.5s-chat', 'abab6-chat', 'MiniMax-M2'] },
            { id: 'mimo', name: 'MiMo', icon: 'mimo', baseUrl: 'https://api.mimo.xiaomi.com/v1/chat/completions', models: ['mimo-v2-flash', 'mimo-v2.5', 'mimo-7b-rl'] },
            { id: 'qwen', name: '通义千问', icon: 'qwen', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', models: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen3-max', 'qwen2.5-max'] }
        ];

        const settingsCategories = [
            { id: 'display', label: '显示设置', icon: 'display' },
            { id: 'keyboard', label: '键盘设置', icon: 'keyboard' },
            { id: 'controls', label: '按键设置', icon: 'controls' },
            { id: 'questions', label: '题目设置', icon: 'questions' },
            { id: 'sound', label: '音乐设置', icon: 'sound' },
            { id: 'export', label: '导出设置', icon: 'export' },
            { id: 'ai', label: 'AI 设置', icon: 'ai' },
            { id: 'data', label: '数据设置', icon: 'data' }
        ];
        let settingsCategory = 'display';

        function settingsCategoryForGroup(group) {
            // 检查是否有显式 data 属性
            const explicit = group.dataset.settingsCategory;
            if (explicit) return explicit;
            const control = group.querySelector('select, input, button');
            const id = control?.id || '';
            if (group.querySelector('#aiProviderList')) return 'ai';
            if (['fontChineseSelect', 'fontLatinSelect', 'bgColorPicker', 'themeToggle', 'fontSizeRange', 'contrastRange', 'graphNodeOpacityRange', 'mindmapNodeOpacityRange', 'graphLinksToggle', 'headerLabelsToggle', 'hideBgShapesToggle'].includes(id)) return 'display';
            if (group.classList.contains('sound-settings-group') || ['soundToggle', 'focusSoundVolumeRange', 'brownFilterRange', 'adaptiveVolumeToggle'].includes(id)) return 'sound';
            if (['keyboardEnabledToggle', 'quizShiftRequiredToggle', 'keyboardCursorStepRange'].includes(id) || group.querySelector('#keyboardBindings')) return 'keyboard';
            if (['soundVolumeRange', 'vibrationToggle', 'clearConfirmToggle', 'homeConfirmToggle'].includes(id)) return 'controls';
            if (['exportFormatSelect', 'graphExportFormatSelect'].includes(id)) return 'export';
            if (['aiProviderList','aiProviderSelect', 'aiBaseUrlInput', 'aiApiKeyInput', 'aiModelInput', 'aiModelSelect', 'useLocalModelToggle', 'browserModelSelect', 'ollamaBaseUrlInput', 'ollamaModelInput'].includes(id)) return 'ai';
            if (['newQuestionRatioRange', 'bankPageSizeRange', 'statsHistoryLimitRange', 'statsTrendDaysRange', 'favoritePreviewAnswerToggle', 'hideStreakToggle', 'calculatorFullExpandToggle'].includes(id)) return 'questions';
            if (['clearImportedQuestionsBtn', 'resetSettingsBtn', 'replayTutorialBtn'].includes(id)) return 'data';
            return 'display';
        }

        function ensureSettingsCategoryLayout() {
            ensureSettingsExtraControls();
            const content = $('settingsModal')?.querySelector('.modal-content');
            if (!content) return;
            let nav = $('settingsCategoryNav');
            if (!nav) {
                nav = document.createElement('div');
                nav.className = 'settings-nav';
                nav.id = 'settingsCategoryNav';
                nav.innerHTML = settingsCategories.map(item => `<button type="button" data-settings-category="${item.id}"><span class="fm-icon ${item.icon}"></span>${item.label}</button>`).join('');
                const title = content.querySelector('h3');
                title?.after(nav);
                nav.addEventListener('click', event => {
                    const btn = event.target.closest('[data-settings-category]');
                    if (!btn) return;
                    settingsCategory = btn.dataset.settingsCategory;
                    settingsPage = 0;
                    layoutSettingsPages();
                });
            }
            let sections = $('settingsSections');
            if (!sections) {
                sections = document.createElement('div');
                sections.className = 'settings-sections';
                sections.id = 'settingsSections';
                content.insertBefore(sections, content.querySelector('.modal-actions'));
            }
            Array.from(content.children).forEach(child => {
                if (child.classList?.contains('settings-group') && child.parentElement !== sections) {
                    sections.appendChild(child);
                }
            });
            Array.from(sections.querySelectorAll('.settings-group')).forEach(group => {
                group.dataset.settingsCategory = settingsCategoryForGroup(group);
            });
            if ($('keyboardBindings')) {
                renderKeyboardBindings();
            }
        }

        let settingsPage = 0;
        function ensureSettingsPager() {
            ensureSettingsCategoryLayout();
            const content = $('settingsModal')?.querySelector('.modal-content');
            if (!content || $('settingsPager')) return;
            const pager = document.createElement('div');
            pager.className = 'settings-pager';
            pager.id = 'settingsPager';
            pager.innerHTML = '<button id=\"settingsPrevPage\">\u4e0a\u4e00\u9875</button><span id=\"settingsPageInfo\">1 / 1</span><button id=\"settingsNextPage\">\u4e0b\u4e00\u9875</button>';
            content.insertBefore(pager, content.querySelector('.modal-actions'));
            $('settingsPrevPage').addEventListener('click', () => { settingsPage--; layoutSettingsPages(); });
            $('settingsNextPage').addEventListener('click', () => { settingsPage++; layoutSettingsPages(); });
        }

        function transitionSettingsSections(oldHeight = null) {
            const el = $('settingsSections');
            if (!el) return;
            const start = oldHeight ?? el.getBoundingClientRect().height;
            const target = Math.max(160, el.scrollHeight);
            clearTimeout(el._heightTimer);
            el.style.height = `${Math.max(1, start)}px`;
            void el.offsetHeight;
            requestAnimationFrame(() => {
                el.style.height = `${target}px`;
                el._heightTimer = setTimeout(() => {
                    if ($('settingsModal')?.classList.contains('show')) el.style.height = 'auto';
                }, 360);
            });
        }

        function layoutSettingsPages() {
            ensureSettingsCategoryLayout();
            ensureSettingsPager();
            const modal = $('settingsModal');
            const sections = $('settingsSections');
            const oldHeight = sections ? sections.getBoundingClientRect().height : 0;
            if (sections && oldHeight) sections.style.height = `${oldHeight}px`;
            if (sections && oldHeight) void sections.offsetHeight;
            if (!settingsCategories.some(item => item.id === settingsCategory)) settingsCategory = 'display';
            const allGroups = Array.from(modal.querySelectorAll('.settings-group'));
            allGroups.forEach(group => {
                group.classList.toggle('settings-hidden', group.dataset.settingsCategory !== settingsCategory);
                group.classList.remove('settings-page-active');
            });
            $$('#settingsCategoryNav button').forEach(btn => btn.classList.toggle('active', btn.dataset.settingsCategory === settingsCategory));
            const groups = allGroups.filter(group => group.dataset.settingsCategory === settingsCategory);
            const availableHeight = window.innerHeight - 170;
            const compactScreen = window.innerWidth <= 720 || window.innerHeight <= 680;
            const estimated = groups.length * 68 + 120;
            const needsPages = compactScreen && estimated > availableHeight;
            modal.classList.toggle('paged', needsPages);
            if (!needsPages) {
                if ($('settingsPager')) $('settingsPager').style.display = 'none';
                transitionSettingsSections(oldHeight);
                return;
            }
            const perPage = Math.max(3, Math.floor(availableHeight / 78));
            const pages = Math.max(1, Math.ceil(groups.length / perPage));
            settingsPage = Math.max(0, Math.min(pages - 1, settingsPage));
            groups.forEach((group, index) => {
                group.classList.toggle('settings-page-active', Math.floor(index / perPage) === settingsPage);
            });
            $('settingsPager').style.display = 'flex';
            $('settingsPageInfo').textContent = `${settingsPage + 1} / ${pages}`;
            $('settingsPrevPage').disabled = settingsPage === 0;
            $('settingsNextPage').disabled = settingsPage >= pages - 1;
            transitionSettingsSections(oldHeight);
        }

        function animateSettingsContentChange(mutator) {
            const modal = $('settingsModal');
            const sections = $('settingsSections');
            const wasOpen = modal?.classList.contains('show') && sections;
            const oldHeight = wasOpen ? sections.getBoundingClientRect().height : 0;
            if (wasOpen) {
                sections.style.height = `${oldHeight}px`;
                void sections.offsetHeight;
            }
            mutator();
            if (!wasOpen) return;
            transitionSettingsSections(oldHeight);
        }

        // 通用折叠/展开动画（用于设置面板内高度变化的元素）
        // 仅在 visible 状态变化时才触发动画，避免无关 applySettings 调用导致抖动
        function applyCollapsibleState(el, visible) {
            if (!el) return;
            const wasVisible = el.dataset.collapsibleVisible;
            const isFirstCall = wasVisible === undefined;
            el.dataset.collapsibleVisible = String(visible);

            if (isFirstCall || wasVisible === String(visible)) {
                // 状态未变化或首次调用 —— 直接设置，不动画
                clearTimeout(el._collapseTimer);
                if (visible) {
                    el.style.maxHeight = 'none';
                    el.style.opacity = '';
                } else {
                    el.style.maxHeight = '0px';
                    el.style.opacity = '0';
                }
                return;
            }

            clearTimeout(el._collapseTimer);
            if (visible) {
                // 展开：从 0 到内容高度
                el.style.maxHeight = '0px';
                el.style.opacity = '0';
                void el.offsetHeight;
                const target = el.scrollHeight;
                if (target > 0) {
                    el.style.maxHeight = target + 'px';
                    el.style.opacity = '1';
                    el._collapseTimer = setTimeout(() => {
                        el.style.maxHeight = 'none';
                        el.style.opacity = '';
                    }, 320);
                } else {
                    el.style.maxHeight = 'none';
                    el.style.opacity = '';
                }
            } else {
                // 折叠：从当前高度到 0
                const current = el.scrollHeight;
                el.style.maxHeight = (current > 0 ? current : 0) + 'px';
                el.style.opacity = '1';
                void el.offsetHeight;
                el.style.maxHeight = '0px';
                el.style.opacity = '0';
                el._collapseTimer = setTimeout(() => {
                    el.style.maxHeight = '';
                    el.style.opacity = '';
                }, 320);
            }
        }

        // Font configuration for settings
        const latinFonts = {
            inter: { name: 'Inter', stack: ['Inter', 'system-ui'] },
            notoSans: { name: 'Noto Sans', stack: ['"Noto Sans"', 'system-ui'] },
            sourceSans: { name: 'Source Sans 3', stack: ['"Source Sans 3"', '"Noto Sans"', 'system-ui'] },
            sourceSerif: { name: 'Source Serif 4', stack: ['"Source Serif 4"', '"Noto Serif"', 'serif'] },
            libreBaskerville: { name: 'Libre Baskerville', stack: ['"Libre Baskerville"', '"Noto Serif"', 'serif'] },
            fredoka: { name: 'Fredoka', stack: ['Fredoka', 'system-ui'] },
            jetbrains: { name: 'JetBrains Mono', stack: ['"JetBrains Mono"', 'monospace'] },
            spaceGrotesk: { name: 'Space Grotesk', stack: ['"Space Grotesk"', 'system-ui'] },
            workSans: { name: 'Work Sans', stack: ['"Work Sans"', 'system-ui'] }
        };

        const chineseFonts = {
            source: { name: '思源黑体', stack: ['"Noto Sans SC"', '"Source Han Sans SC"', 'sans-serif'] },
            sourceSerif: { name: '思源宋体', stack: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'] },
            songti: { name: '宋体 / SimSun', stack: ['SimSun', '"Songti SC"', '"Noto Serif SC"', '"Source Han Serif SC"', 'serif'] },
            wqy: { name: '文泉驿正黑', stack: ['"WenQuanYi Micro Hei"', '"Noto Sans SC"', 'sans-serif'] },
            lxgw: { name: '霞鹜文楷', stack: ['"LXGW WenKai"', '"Noto Serif SC"', 'serif'] },
            zcool: { name: '站酷快乐体', stack: ['"ZCOOL KuaiLe"', '"Noto Sans SC"', 'sans-serif'] }
        };
        function applySettings() {
            ensureSettingsExtraControls();
            ensureSettingsPager();
            const legacyLatinMap = {};
            const legacyChineseMap = {};
            if (!latinFonts[settings.fontLatin]) settings.fontLatin = legacyLatinMap[settings.fontLatin] || 'inter';
            if (!chineseFonts[settings.fontChinese]) settings.fontChinese = legacyChineseMap[settings.fontChinese] || 'source';
            const latin = latinFonts[settings.fontLatin] || latinFonts.inter;
            const chinese = chineseFonts[settings.fontChinese] || chineseFonts.source;
            settings.fontSize = Math.max(14, Math.min(19, Number(settings.fontSize) || 16));
            settings.contrast = Math.max(90, Math.min(125, Number(settings.contrast) || 100));
            settings.graphNodeOpacity = Math.max(55, Math.min(100, Number(settings.graphNodeOpacity) || 86));
            settings.mindmapNodeOpacity = Math.max(55, Math.min(100, Number(settings.mindmapNodeOpacity) || 88));
            settings.graphLinksVisible = settings.graphLinksVisible !== false;
            settings.favoritePreviewAnswer = settings.favoritePreviewAnswer === true;
            settings.hideStreaks = settings.hideStreaks === true;
            settings.bankPageSize = bankPageSize();
            settings.statsHistoryLimit = Math.max(5, Math.min(40, Math.round((Number(settings.statsHistoryLimit) || 5) / 5) * 5));
            settings.newQuestionRatio = Math.max(0, Math.min(100, Math.round((Number(settings.newQuestionRatio) || 50) / 5) * 5));
            settings.calculatorFullExpand = settings.calculatorFullExpand === true;
            settings.soundVolume = Math.max(0, Math.min(100, Number(settings.soundVolume) ?? 50));
            settings.sound = { ...defaultSettings.sound, ...(settings.sound || {}) };
            settings.sound.volume = Math.max(0, Math.min(1, Number(settings.sound.volume) || defaultSettings.sound.volume));
            settings.sound.binauralFreq = [40, 18, 12].includes(Number(settings.sound.binauralFreq)) ? Number(settings.sound.binauralFreq) : defaultSettings.sound.binauralFreq;
            settings.sound.binauralBase = Math.max(100, Math.min(500, Number(settings.sound.binauralBase) || defaultSettings.sound.binauralBase));
            settings.sound.brownFilter = Math.max(100, Math.min(1000, Number(settings.sound.brownFilter) || defaultSettings.sound.brownFilter));
            settings.sound.ambientVoices = Math.max(1, Math.min(8, Number(settings.sound.ambientVoices) || defaultSettings.sound.ambientVoices));
            settings.sound.adaptiveVolume = settings.sound.adaptiveVolume !== false;
            settings.keyboard = {
                enabled: (settings.keyboard || {}).enabled !== false,
                quizShiftRequired: (settings.keyboard || {}).quizShiftRequired !== false,
                cursorStep: Math.max(8, Math.min(80, Number((settings.keyboard || {}).cursorStep) || defaultSettings.keyboard.cursorStep || 24)),
                bindings: { ...defaultSettings.keyboard.bindings, ...((settings.keyboard || {}).bindings || {}) },
                disabled: Array.isArray((settings.keyboard || {}).disabled) ? (settings.keyboard || {}).disabled.slice() : []
            };
            settings.headerLabelsVisible = settings.headerLabelsVisible === true;
            settings.hideBackgroundShapes = settings.hideBackgroundShapes === true;
            settings.homeConfirm = settings.homeConfirm !== false;
            const paper = settings.darkMode ? '#0f172a' : (settings.bgColor || '#FDFBF7');
            document.body.style.fontFamily = [...latin.stack, ...chinese.stack, 'sans-serif'].join(', ');
            document.documentElement.style.setProperty('--app-font-size', `${settings.fontSize}px`);
            document.documentElement.style.setProperty('--app-contrast', String(settings.contrast / 100));
            document.documentElement.style.setProperty('--paper', paper);
            document.body.style.setProperty('--paper', paper);
            document.body.classList.toggle('dark', !!settings.darkMode);
            if (settings.darkMode) document.body.style.backgroundColor = '';
            else document.body.style.backgroundColor = settings.bgColor || '#FDFBF7';
            $('fontChineseSelect').value = settings.fontChinese;
            $('fontLatinSelect').value = settings.fontLatin;
            $('bgColorPicker').value = settings.bgColor || '#FDFBF7';
            $('themeToggle').classList.toggle('active', !!settings.darkMode);
            $('themeToggle').textContent = settings.darkMode ? '\u591c\u95f4\u6a21\u5f0f' : '\u65e5\u95f4\u6a21\u5f0f';
            $('fontSizeRange').value = settings.fontSize;
            $('fontSizeValue').textContent = `${settings.fontSize}px`;
            $('hideStreakToggle').classList.toggle('active', !settings.hideStreaks);
            $('hideStreakToggle').textContent = settings.hideStreaks ? '\u9690\u85cf\u8fde\u80dc\u8bb0\u5f55' : '\u663e\u793a\u8fde\u80dc\u8bb0\u5f55';
            $('soundVolumeRange').value = settings.soundVolume;
            $('soundVolumeValue').textContent = `${settings.soundVolume}%`;
            $('contrastRange').value = settings.contrast;
            $('contrastValue').textContent = `${settings.contrast}%`;
            $('graphNodeOpacityRange').value = settings.graphNodeOpacity;
            $('graphNodeOpacityValue').textContent = `${settings.graphNodeOpacity}%`;
            $('graphLinksToggle').classList.toggle('active', !!settings.graphLinksVisible);
            $('graphLinksToggle').textContent = settings.graphLinksVisible ? '\u663e\u793a\u8fde\u7ebf' : '\u9690\u85cf\u8fde\u7ebf';
            $('mindmapNodeOpacityRange').value = settings.mindmapNodeOpacity;
            $('mindmapNodeOpacityValue').textContent = `${settings.mindmapNodeOpacity}%`;
            $('favoritePreviewAnswerToggle').classList.toggle('active', !!settings.favoritePreviewAnswer);
            $('favoritePreviewAnswerToggle').textContent = settings.favoritePreviewAnswer ? '\u9884\u89c8\u663e\u793a\u7b54\u6848' : '\u9884\u89c8\u4e0d\u663e\u793a\u7b54\u6848';
            $('bankPageSizeRange').value = settings.bankPageSize;
            $('bankPageSizeValue').textContent = `${settings.bankPageSize}题`;
            $('statsHistoryLimitRange').value = settings.statsHistoryLimit;
            $('statsHistoryLimitValue').textContent = `${settings.statsHistoryLimit}次`;
            $('statsTrendDaysRange').value = settings.statsTrendDays;
            $('statsTrendDaysValue').textContent = `${settings.statsTrendDays}天`;
            $('newQuestionRatioRange').value = settings.newQuestionRatio;
            $('newQuestionRatioValue').textContent = `${settings.newQuestionRatio}%`;
            const calcExpandToggle = $('calculatorFullExpandToggle');
            if (calcExpandToggle) {
                calcExpandToggle.classList.toggle('active', !!settings.calculatorFullExpand);
                calcExpandToggle.textContent = settings.calculatorFullExpand ? '\u5b8c\u5168\u5c55\u5f00\u663e\u793a' : '\u9700\u8981\u6eda\u52a8\u663e\u793a';
            }
            document.body.classList.toggle('calc-full-expand', !!settings.calculatorFullExpand);
            $('exportFormatSelect').value = settings.exportFormat || 'txt';
            $('graphExportFormatSelect').value = settings.graphExportFormat || 'svg';
            settings.aiProvider = settings.aiProvider || 'auto';
            $('aiProviderSelect') ? ($('aiProviderSelect').value = settings.aiProvider) : null;
            $('aiBaseUrlInput').value = settings.aiBaseUrl || '';
            $('aiApiKeyInput').value = settings.aiApiKey || '';
            $('aiModelInput').value = settings.aiModel || '';
            renderAiProviders();
            updateAiModelOptions();
            // 本地 / 离线模型设置同步
            const localToggle = $('useLocalModelToggle');
            if (localToggle) {
                localToggle.classList.toggle('active', !!settings.useLocalModel);
                localToggle.textContent = settings.useLocalModel ? '本地模型已开启' : '使用本地模型';
            }
            const localOptions = $('localModelOptions');
            if (localOptions) localOptions.style.display = settings.useLocalModel ? '' : 'none';
            const browserPane = $('browserModelPane');
            const ollamaPane = $('ollamaModelPane');
            if (browserPane) browserPane.style.display = (settings.useLocalModel && settings.localModelType === 'browser') ? '' : 'none';
            if (ollamaPane) ollamaPane.style.display = (settings.useLocalModel && settings.localModelType === 'ollama') ? '' : 'none';
            if ($('browserModelSelect')) $('browserModelSelect').value = settings.browserModel || '';
            if ($('ollamaBaseUrlInput')) $('ollamaBaseUrlInput').value = settings.ollamaBaseUrl || 'http://localhost:11434';
            if ($('ollamaModelInput')) $('ollamaModelInput').value = settings.ollamaModel || '';
            $$('.local-model-tab').forEach(t => t.classList.toggle('active', t.dataset.localType === settings.localModelType));
            initExportSelectors();
            $('clearConfirmToggle').classList.toggle('active', !!settings.clearConfirm);
            $('homeConfirmToggle').classList.toggle('active', !!settings.homeConfirm);
            $('homeConfirmToggle').textContent = settings.homeConfirm ? '\u8fd4\u56de\u524d\u63d0\u793a' : '\u76f4\u63a5\u8fd4\u56de\u9996\u9875';
            $('clearConfirmToggle').textContent = settings.clearConfirm ? '\u6e05\u7a7a\u524d\u63d0\u793a' : '\u6e05\u7a7a\u524d\u4e0d\u63d0\u793a';
            $('vibrationToggle').classList.toggle('active', !!settings.vibrationEnabled);
            $('vibrationToggle').textContent = settings.vibrationEnabled ? '\u5f00\u542f\u9707\u52a8' : '\u5173\u95ed\u9707\u52a8';
            $$('#bgColorPresets .color-preset').forEach(btn => btn.classList.toggle('active', btn.dataset.color.toLowerCase() === (settings.bgColor || '').toLowerCase()));
            const kbToggle = $('keyboardEnabledToggle');
            if (kbToggle) {
                kbToggle.classList.toggle('active', !!settings.keyboard.enabled);
                kbToggle.textContent = settings.keyboard.enabled ? '键盘快捷键已开启' : '键盘快捷键已关闭';
            }
            const quizShiftToggle = $('quizShiftRequiredToggle');
            if (quizShiftToggle) {
                quizShiftToggle.classList.toggle('active', !!settings.keyboard.quizShiftRequired);
                quizShiftToggle.textContent = settings.keyboard.quizShiftRequired ? '答题需 Shift 修饰' : '答题直接按键';
            }
            if ($('keyboardCursorStepRange')) {
                $('keyboardCursorStepRange').value = settings.keyboard.cursorStep;
                $('keyboardCursorStepValue').textContent = `${settings.keyboard.cursorStep} px`;
            }
            const headerLabelsToggle = $('headerLabelsToggle');
            if (headerLabelsToggle) {
                headerLabelsToggle.classList.toggle('active', !!settings.headerLabelsVisible);
                headerLabelsToggle.textContent = settings.headerLabelsVisible ? '一直显示' : '悬停时显示';
            }
            document.body.classList.toggle('header-labels-on', !!settings.headerLabelsVisible);
            const hideBgToggle = $('hideBgShapesToggle');
            if (hideBgToggle) {
                hideBgToggle.classList.toggle('active', !settings.hideBackgroundShapes);
                hideBgToggle.textContent = settings.hideBackgroundShapes ? '隐藏背景物体' : '显示背景物体';
            }
            document.body.classList.toggle('hide-bg-shapes', !!settings.hideBackgroundShapes);
            applySoundSettings();
            updateQuizSoundUI();
        }

        function applySoundSettings() {
            const s = settings.sound;
            const toggle = $('soundToggle');
            if (toggle) toggle.textContent = s.enabled ? 'ON \u80cc\u666f\u97f3\u4e50' : 'OFF \u80cc\u666f\u97f3\u4e50';
            const options = $('soundOptions');
            const expandSoundOptions = () => {
                if (!options || !s.enabled) return;
                const target = Math.min(900, Math.max(520, options.scrollHeight + 96));
                options.style.maxHeight = `${target}px`;
            };
            if (options) {
                options.style.display = 'block';
                options.classList.toggle('sound-options-hidden', !s.enabled);
                options.style.maxHeight = s.enabled ? `${Math.min(900, Math.max(520, options.scrollHeight + 96))}px` : '0px';
            }

            $$('.sound-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.sound === s.mode));
            const brownParams = $('brownParams');
            const binauralParams = $('binauralParams');
            if (brownParams) brownParams.style.display = 'block';
            if (binauralParams) binauralParams.style.display = 'block';
            [
                [brownParams, s.mode === 'brown'],
                [binauralParams, s.mode === 'binaural']
            ].forEach(([el, visible]) => {
                if (!el) return;
                el.classList.toggle('sound-param-hidden', !visible);
                el.style.maxHeight = visible ? `${el.scrollHeight + 16}px` : '0px';
            });
            if (options && s.enabled) {
                requestAnimationFrame(expandSoundOptions);
                setTimeout(expandSoundOptions, 180);
                setTimeout(expandSoundOptions, 360);
            }

            const volRange = $('focusSoundVolumeRange');
            if (volRange) volRange.value = Math.round(s.volume * 100);
            const volValue = $('focusSoundVolumeValue');
            if (volValue) volValue.textContent = Math.round(s.volume * 100) + '%';

            const brownRange = $('brownFilterRange');
            if (brownRange) brownRange.value = s.brownFilter;
            const brownValue = $('brownFilterValue');
            if (brownValue) brownValue.textContent = s.brownFilter + 'Hz';

            $$('#binauralParams .option-btn').forEach(btn => {
                btn.classList.toggle('selected', Number(btn.dataset.freq) === s.binauralFreq);
            });
            const adaptiveBtn = $('adaptiveVolumeToggle');
            if (adaptiveBtn) adaptiveBtn.textContent = (s.adaptiveVolume ? 'ON ' : 'OFF ') + '\u968f\u96be\u5ea6\u81ea\u52a8\u8c03\u8282\u97f3\u91cf';
        }

        function updateQuizSoundUI() {
            const btn = $('quizSoundBtn');
            if (btn) {
                btn.classList.toggle('active', settings.sound.enabled);
            btn.title = settings.sound.enabled ? '\u80cc\u666f\u97f3\u4e50\u5df2\u5f00\u542f' : '\u80cc\u666f\u97f3\u4e50\u5df2\u5173\u95ed';
            }
            $$('.sound-micro-mode').forEach(b => b.classList.toggle('active', b.dataset.sound === settings.sound.mode));
            const vol = $('quizSoundVolume');
            if (vol) vol.value = Math.round(settings.sound.volume * 100);
            const toggle = $('quizSoundToggle');
            if (toggle) toggle.textContent = settings.sound.enabled ? 'ON \u80cc\u666f\u97f3\u4e50' : 'OFF \u80cc\u666f\u97f3\u4e50';
        }

        function syncAiConfigToServer() {
            fetch(apiUrl('/api/ai-config'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: settings.aiProvider, baseUrl: settings.aiBaseUrl, apiKey: settings.aiApiKey, model: settings.aiModel,
                    useLocalModel: settings.useLocalModel, localModelType: settings.localModelType,
                    browserModel: settings.browserModel, ollamaBaseUrl: settings.ollamaBaseUrl, ollamaModel: settings.ollamaModel
                })
            }).catch(() => {});
        }

        function renderAiProviders() {
            const list = $('aiProviderList');
            if (!list) return;
            list.innerHTML = aiProviders.map(p =>
                `<button class="ai-provider-btn${settings.aiProvider === p.id ? ' active' : ''}" data-provider="${p.id}">
                    <span class="fm-icon ${p.icon}"></span>
                    <span>${p.name}</span>
                </button>`
            ).join('');
        }

        function updateAiModelOptions() {
            const provider = aiProviders.find(p => p.id === settings.aiProvider);
            const select = $('aiModelSelect');
            const input = $('aiModelInput');
            if (!select || !input) return;
            // 确保输入框始终可编辑
            input.readOnly = false;
            input.disabled = false;
            if (provider && provider.models.length > 0) {
                select.innerHTML = '<option value="">-- 选择模型 --</option>' +
                    provider.models.map(m => `<option value="${m}"${settings.aiModel === m ? ' selected' : ''}>${m}</option>`).join('');
                select.style.display = '';
                input.placeholder = '选择下拉或手动输入模型';
            } else {
                select.style.display = 'none';
                input.placeholder = '请手动输入模型名称';
            }
        }

        async function loadAiConfigFromServer() {
            try {
                const res = await fetch(apiUrl('/api/ai-config'));
                const data = await res.json();
                if (!data.ok || !data.config) return;
                if ((!settings.aiProvider || settings.aiProvider === 'auto') && data.config.provider) settings.aiProvider = data.config.provider;
                if (!settings.aiBaseUrl && data.config.baseUrl) settings.aiBaseUrl = data.config.baseUrl;
                if (!settings.aiModel && data.config.model) settings.aiModel = data.config.model;
                applySettings();
            } catch (_) {}
        }

        const wb = { canvas: null, ctx: null, color: '#1e293b', size: 3, tool: null, drawing: false, start: null, last: null, lastMid: null, resizing: false, shapeStart: null, previewSnapshot: null };

        function resizeWhiteboardCanvas() {
            const canvas = $('wbCanvas');
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            if (rect.width < 1 || rect.height < 1) return;
            const dpr = Math.max(1, window.devicePixelRatio || 1);
            const newWidth = Math.round(rect.width * dpr);
            const newHeight = Math.round(rect.height * dpr);
            if (canvas.width === newWidth && canvas.height === newHeight) return;

            // Copy the current drawing before resizing. Restore it without
            // scaling so circles and strokes keep their original proportions.
            let snapshot = null;
            if (canvas.width && canvas.height) {
                snapshot = document.createElement('canvas');
                snapshot.width = canvas.width;
                snapshot.height = canvas.height;
                snapshot.getContext('2d').drawImage(canvas, 0, 0);
            }

            canvas.width = newWidth;
            canvas.height = newHeight;
            wb.ctx = canvas.getContext('2d');
            wb.ctx.setTransform(1, 0, 0, 1, 0, 0);
            wb.ctx.lineCap = 'round';
            wb.ctx.lineJoin = 'round';

            if (snapshot) {
                wb.ctx.drawImage(snapshot, 0, 0);
            }
        }

        function applyWhiteboardHeight(height) {
            const normalized = Math.round(height);
            $('whiteboard').style.height = `${normalized}px`;
            document.body.style.setProperty('--whiteboard-height', `${normalized}px`);
        }

        function pointFromEvent(event) {
            const canvas = $('wbCanvas');
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
        }

        function effectiveStrokeColor() {
            if (document.body.classList.contains('dark') && wb.color.toLowerCase() === '#1e293b') return '#e2e8f0';
            return wb.color;
        }

        function drawLine(from, to, erase = false) {
            const ctx = wb.ctx;
            ctx.save();
            ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
            ctx.strokeStyle = effectiveStrokeColor();
            const scale = wb.canvas.width / wb.canvas.getBoundingClientRect().width;
            ctx.lineWidth = (erase ? wb.size * 3 : wb.size) * scale;
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
            ctx.restore();
        }

        // Smooth freehand stroke using quadratic B茅zier segments through the
        // midpoints of successive sample points. This makes the pen follow the
        // pointer closely while rounding off corners, so curves and arcs draw
        // smoothly instead of as jagged polyline segments.
        function drawSmoothSegment(prev, control, to, erase = false) {
            const ctx = wb.ctx;
            ctx.save();
            ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
            ctx.strokeStyle = effectiveStrokeColor();
            const scale = wb.canvas.width / wb.canvas.getBoundingClientRect().width;
            ctx.lineWidth = (erase ? wb.size * 3 : wb.size) * scale;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.quadraticCurveTo(control.x, control.y, to.x, to.y);
            ctx.stroke();
            ctx.restore();
        }

        function drawCircle(center, edge) {
            const radius = Math.hypot(edge.x - center.x, edge.y - center.y);
            const scale = wb.canvas.width / wb.canvas.getBoundingClientRect().width;
            wb.ctx.save();
            wb.ctx.strokeStyle = effectiveStrokeColor();
            wb.ctx.lineWidth = wb.size * scale;
            wb.ctx.beginPath();
            wb.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
            wb.ctx.stroke();
            wb.ctx.restore();
        }

        function captureWhiteboard() {
            wb.previewSnapshot = wb.ctx.getImageData(0, 0, wb.canvas.width, wb.canvas.height);
        }

        function restoreWhiteboardPreview() {
            if (wb.previewSnapshot) wb.ctx.putImageData(wb.previewSnapshot, 0, 0);
        }

        function drawShapePreview(point) {
            if (!wb.shapeStart || !wb.previewSnapshot) return;
            restoreWhiteboardPreview();
            if (wb.tool === 'line') drawLine(wb.shapeStart, point, false);
            if (wb.tool === 'circle') drawCircle(wb.shapeStart, point);
        }

        function clearWhiteboard(confirmFirst = true) {
            if (confirmFirst && !confirm('\u6e05\u7a7a\u8349\u7a3f\u7eb8\uff1f')) return;
            const canvas = $('wbCanvas');
            if (!wb.ctx || !canvas) return;
            wb.ctx.clearRect(0, 0, canvas.width, canvas.height);
            wb.shapeStart = null;
            wb.previewSnapshot = null;
        }

        function initWhiteboard() {
            wb.canvas = $('wbCanvas');
            wb.ctx = wb.canvas.getContext('2d');
            applyWhiteboardHeight(parseFloat($('whiteboard').style.height) || 160);
            resizeWhiteboardCanvas();
            $('whiteboard').addEventListener('pointerdown', () => bringFloatingLayerToFront('whiteboard'));
            wb.canvas.addEventListener('pointerdown', event => {
                if (!wb.tool) return;
                if (event.button !== 0) return;
                const point = pointFromEvent(event);
                if (wb.tool === 'line' || wb.tool === 'circle') {
                    if (!wb.shapeStart) {
                        wb.shapeStart = point;
                        captureWhiteboard();
                    } else {
                        restoreWhiteboardPreview();
                        if (wb.tool === 'line') drawLine(wb.shapeStart, point, false);
                        if (wb.tool === 'circle') drawCircle(wb.shapeStart, point);
                        wb.shapeStart = null;
                        wb.previewSnapshot = null;
                    }
                    return;
                }
                wb.drawing = true;
                wb.shapeStart = null;
                wb.canvas.setPointerCapture(event.pointerId);
                wb.start = point;
                wb.last = point;
                wb.lastMid = point;
                // Draw a dot so a single tap leaves a mark.
                drawSmoothSegment(point, point, point, wb.tool === 'eraser');
            });
            wb.canvas.addEventListener('pointermove', event => {
                if ((wb.tool === 'line' || wb.tool === 'circle') && wb.shapeStart) {
                    drawShapePreview(pointFromEvent(event));
                    return;
                }
                if (!wb.drawing) return;
                const next = pointFromEvent(event);
                if (wb.tool === 'pen' || wb.tool === 'eraser') {
                    const mid = { x: (wb.last.x + next.x) / 2, y: (wb.last.y + next.y) / 2 };
                    drawSmoothSegment(wb.lastMid, wb.last, mid, wb.tool === 'eraser');
                    wb.lastMid = mid;
                }
                wb.last = next;
            });
            wb.canvas.addEventListener('pointerup', event => {
                if (!wb.drawing) return;
                wb.drawing = false;
                // Close the tail of the stroke up to the final sample point.
                if (wb.tool === 'pen' || wb.tool === 'eraser') {
                    drawSmoothSegment(wb.lastMid, wb.last, wb.last, wb.tool === 'eraser');
                }
            });
            $('wbResizeHandle').addEventListener('pointerdown', event => {
                if (window.matchMedia('(max-width: 640px)').matches) return;
                wb.resizing = true;
                $('wbResizeHandle').setPointerCapture(event.pointerId);
                setWhiteboardHeight(event.clientY);
            });
            $('wbResizeHandle').addEventListener('pointermove', event => {
                if (wb.resizing) setWhiteboardHeight(event.clientY);
            });
            $('wbResizeHandle').addEventListener('pointerup', () => { wb.resizing = false; });
            $$('.wb-color').forEach(btn => btn.addEventListener('click', () => {
                wb.color = btn.dataset.color;
                $$('.wb-color').forEach(x => x.classList.toggle('active', x === btn));
            }));
            $$('.wb-tool').forEach(btn => btn.addEventListener('click', () => {
                wb.tool = btn.dataset.tool;
                wb.shapeStart = null;
                wb.previewSnapshot = null;
                wb.drawing = false;
                $$('.wb-tool').forEach(x => x.classList.toggle('active', x === btn));
            }));
            $('wbSize').addEventListener('input', event => { wb.size = Number(event.target.value); });
            $('wbClear').addEventListener('click', () => clearWhiteboard(!!settings.clearConfirm));
            window.addEventListener('resize', resizeWhiteboardCanvas);
        }

        function setWhiteboardHeight(clientY) {
            const min = window.innerWidth <= 640 ? 110 : 130;
            const max = Math.round(window.innerHeight * 0.78);
            const height = Math.max(min, Math.min(max, window.innerHeight - clientY));
            applyWhiteboardHeight(height);
            resizeWhiteboardCanvas();
        }

        let bgAnimationId = null;
        function initBackground() {
            const canvas = $('bgCanvas');
            if (!canvas) return;
            const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
            const mobile = window.matchMedia?.('(max-width: 720px)').matches || window.innerWidth <= 720;
            if (reducedMotion || mobile) {
                canvas.style.display = 'none';
                if (bgAnimationId) cancelAnimationFrame(bgAnimationId);
                bgAnimationId = null;
                return;
            }
            const ctx = canvas.getContext('2d');
            const symbols = ['∫', 'λ', 'Σ', 'π', 'dx', 'P'];
            const dots = Array.from({ length: 18 }, (_, i) => ({ x: Math.random(), y: Math.random(), s: symbols[i % symbols.length], v: 0.00035 + Math.random() * 0.00045 }));
            let lastFrame = 0;
            const draw = () => {
                if (document.hidden) {
                    bgAnimationId = requestAnimationFrame(draw);
                    return;
                }
                const now = performance.now();
                if (now - lastFrame < 48) {
                    bgAnimationId = requestAnimationFrame(draw);
                    return;
                }
                lastFrame = now;
                const dpr = Math.min(1.5, Math.max(1, window.devicePixelRatio || 1));
                const w = window.innerWidth, h = window.innerHeight;
                if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
                    canvas.width = Math.round(w * dpr);
                    canvas.height = Math.round(h * dpr);
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                }
                ctx.clearRect(0, 0, w, h);
                ctx.globalAlpha = settings.darkMode ? 0.08 : 0.07;
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ocean');
                ctx.font = '700 18px JetBrains Mono';
                dots.forEach(dot => {
                    dot.y = (dot.y + dot.v) % 1;
                    ctx.fillText(dot.s, dot.x * w, dot.y * h);
                });
                bgAnimationId = requestAnimationFrame(draw);
            };
            draw();
        }

        function initCalculator() {
            const panel = $('calcPanel');
            const display = $('calcDisplay');
            const preview = $('calcLatexPreview');
            if (!panel || !display) return;
            let angleMode = 'rad';

            function ensureAdvancedCalcKeys() {
                if (panel.dataset.advanced === 'true') return;
                panel.dataset.advanced = 'true';
                const actions = panel.querySelector('.calc-actions');
                const angleBtn = document.createElement('button');
                angleBtn.className = 'calc-func calc-angle active';
                angleBtn.type = 'button';
                angleBtn.dataset.calc = 'angle';
                angleBtn.textContent = 'RAD';
                angleBtn.title = '\u89d2\u5ea6 / \u5f27\u5ea6';
                actions?.insertBefore(angleBtn, actions.firstChild);
                const scroll = panel.querySelector('.calc-body-scroll');
                const fill = panel.querySelector('.calc-fill-wrap');
                const sep = document.createElement('div');
                sep.className = 'calc-sep';
                sep.textContent = '\u6807\u51c6\u51fd\u6570';
                const grid = document.createElement('div');
                grid.className = 'calc-grid calc-small';
                [
                    ['\\arcsin', '\\arcsin'], ['\\arccos', '\\arccos'], ['\\arctan', '\\arctan'],
                    ['x^2', '^{2}'], ['x^3', '^{3}'], ['10^x', '10^{}'], ['e^x', 'e^{}'],
                    ['|x|', '\\left|\\right|'], ['n!', '!'], ['1/x', '^{-1}'],
                    ['\\lfloor x\\rfloor', '\\lfloor\\rfloor'], ['\\lceil x\\rceil', '\\lceil\\rceil'],
                    ['round', '\\operatorname{round}'], ['min', '\\min'], ['max', '\\max']
                ].forEach(([label, insert]) => {
                    const btn = document.createElement('button');
                    btn.className = 'calc-key';
                    btn.type = 'button';
                    btn.dataset.insert = insert;
                    btn.textContent = label;
                    grid.appendChild(btn);
                });
                scroll?.insertBefore(sep, fill);
                scroll?.insertBefore(grid, fill);
            }

            function clampCalcPosition(left, top) {
                const rect = panel.getBoundingClientRect();
                const width = Math.min(rect.width || 44, window.innerWidth);
                const height = Math.min(rect.height || 44, window.innerHeight);
                const margin = 4;
                const nextLeft = Math.max(margin, Math.min(window.innerWidth - width - margin, left));
                const nextTop = Math.max(margin, Math.min(window.innerHeight - height - margin, top));
                panel.style.left = `${nextLeft}px`;
                panel.style.top = `${nextTop}px`;
                panel.style.right = 'auto';
                panel.style.bottom = 'auto';
                panel.style.maxHeight = settings.calculatorFullExpand ? '' : `${Math.max(120, window.innerHeight - nextTop - margin)}px`;
            }

            function clampCurrentCalcPosition() {
                const rect = panel.getBoundingClientRect();
                clampCalcPosition(rect.left, rect.top);
            }

            window.resetCalculatorPosition = function resetCalculatorPosition() {
                if (window.matchMedia('(max-width: 640px)').matches) return;
                panel.setAttribute('aria-expanded', 'true');
                requestAnimationFrame(() => {
                    const rect = panel.getBoundingClientRect();
                    const margin = 14;
                    const left = window.innerWidth - (rect.width || 360) - margin;
                    const top = Math.max(76, Math.min(window.innerHeight * 0.18, window.innerHeight - (rect.height || 420) - margin));
                    clampCalcPosition(left, top);
                });
            };

            panel.addEventListener('pointerdown', () => bringFloatingLayerToFront('calc'));

            function insertAtCursor(text) {
                const start = display.selectionStart ?? display.value.length;
                const end = display.selectionEnd ?? start;
                display.value = display.value.slice(0, start) + text + display.value.slice(end);
                const newPos = start + text.length;
                display.setSelectionRange(newPos, newPos);
                updateCalcPreview();
                display.focus();
            }

            function moveCursor(offset) {
                const pos = Math.max(0, Math.min(display.value.length, (display.selectionStart ?? display.value.length) + offset));
                display.setSelectionRange(pos, pos);
                display.focus();
            }

            function updateCalcPreview() {
                const raw = display.value;
                if (!raw.trim()) {
                    preview.innerHTML = '';
                    return;
                }
                const rendered = displayLatexExpression(raw);
                if (window.katex) {
                    try { katex.render(rendered, preview, { throwOnError: false }); }
                    catch (e) { preview.textContent = raw; }
                } else {
                    preview.textContent = raw;
                }
            }

            function latexToJs(expr) {
                let s = replaceLatexFractions(expr);
                s = s.replace(/\\pi/g, 'Math.PI');
                s = s.replace(/\\arcsin/g, '__asin');
                s = s.replace(/\\arccos/g, '__acos');
                s = s.replace(/\\arctan/g, '__atan');
                s = s.replace(/\\sin/g, '__sin');
                s = s.replace(/\\cos/g, '__cos');
                s = s.replace(/\\tan/g, '__tan');
                s = s.replace(/\\cot/g, '__cot');
                s = s.replace(/\\sec/g, '__sec');
                s = s.replace(/\\csc/g, '__csc');
                s = s.replace(/\\ln/g, 'Math.log');
                s = s.replace(/\\log/g, 'Math.log10');
                s = s.replace(/\\exp/g, 'Math.exp');
                s = s.replace(/\\sqrt\{(.*?)\}/g, 'Math.sqrt($1)');
                s = s.replace(/\\left\|(.+?)\\right\|/g, 'Math.abs($1)');
                s = s.replace(/\\lfloor(.+?)\\rfloor/g, 'Math.floor($1)');
                s = s.replace(/\\lceil(.+?)\\rceil/g, 'Math.ceil($1)');
                s = s.replace(/\\operatorname\{round\}/g, 'Math.round');
                s = s.replace(/\\min/g, 'Math.min');
                s = s.replace(/\\max/g, 'Math.max');
                s = s.replace(/\\cdot|\\times|×|·/g, '*');
                s = s.replace(/\\div|÷/g, '/');
                s = s.replace(/(?<=\d)(?=Math\.PI|[a-zA-Z(])/g, '*');
                s = s.replace(/(?<=\))(?=(Math\.PI|[a-zA-Z0-9(]))/g, '*');
                s = s.replace(/(\d+|\([^()]*\))!/g, 'fact($1)');
                s = s.replace(/\^/g, '**');
                s = s.replace(/mod/g, '%');
                s = s.replace(/[^0-9+\-*/().%MathPI_abcdefghijklmnopqrstuvwxyz\[\],\s]/g, '');
                return s;
            }

            function evaluateCalc() {
                const raw = display.value.trim();
                if (!raw) return;
                const js = latexToJs(raw);
                try {
                    const toRad = x => angleMode === 'deg' ? x * Math.PI / 180 : x;
                    const fromRad = x => angleMode === 'deg' ? x * 180 / Math.PI : x;
                    const fact = n => {
                        n = Number(n);
                        if (!Number.isInteger(n) || n < 0 || n > 170) return NaN;
                        let out = 1;
                        for (let i = 2; i <= n; i++) out *= i;
                        return out;
                    };
                    const result = new Function('__sin','__cos','__tan','__cot','__sec','__csc','__asin','__acos','__atan','fact', 'return (' + js + ')')(
                        x => Math.sin(toRad(x)),
                        x => Math.cos(toRad(x)),
                        x => Math.tan(toRad(x)),
                        x => 1 / Math.tan(toRad(x)),
                        x => 1 / Math.cos(toRad(x)),
                        x => 1 / Math.sin(toRad(x)),
                        x => fromRad(Math.asin(x)),
                        x => fromRad(Math.acos(x)),
                        x => fromRad(Math.atan(x)),
                        fact
                    );
                    const resultText = String(result).replace(/Infinity/g, '\\infty').replace(/NaN/g, '\\text{閿欒}');
                    display.value = resultText;
                    updateCalcPreview();
                } catch (e) {
                    preview.innerHTML = '<span style="color:var(--coral)">\u65e0\u6cd5\u8ba1\u7b97</span>';
                }
            }

            function backspaceCalc() {
                const start = display.selectionStart ?? display.value.length;
                const end = display.selectionEnd ?? start;
                if (start === end) {
                    if (start > 0) {
                        display.value = display.value.slice(0, start - 1) + display.value.slice(start);
                        display.setSelectionRange(start - 1, start - 1);
                    }
                } else {
                    display.value = display.value.slice(0, start) + display.value.slice(end);
                    display.setSelectionRange(start, start);
                }
                updateCalcPreview();
                display.focus();
            }

            function fillCalcToAnswer() {
                $('calcFill')?.click();
            }

            function toggleAngleMode() {
                const btn = panel.querySelector('.calc-func[data-calc="angle"]');
                angleMode = angleMode === 'rad' ? 'deg' : 'rad';
                if (btn) {
                    btn.textContent = angleMode === 'rad' ? 'RAD' : 'DEG';
                    btn.classList.toggle('active', angleMode === 'rad');
                }
                display.focus();
            }

            window.focusMathCalc = {
                insert: insertAtCursor,
                evaluate: evaluateCalc,
                backspace: backspaceCalc,
                clear() { display.value = ''; updateCalcPreview(); display.focus(); },
                fill: fillCalcToAnswer,
                angle: toggleAngleMode,
                focus() { display.focus(); bringFloatingLayerToFront('calc'); },
                hasValue() { return !!display.value; }
            };

            ensureAdvancedCalcKeys();

            // Drag the whole panel by the M toggle.
            const toggle = $('calcToggle');
            let drag = { active: false, startX: 0, startY: 0, startLeft: 0, startTop: 0, moved: false };
            toggle.addEventListener('pointerdown', e => {
                if (window.matchMedia('(max-width: 640px)').matches) return;
                bringFloatingLayerToFront('calc');
                drag.active = true;
                drag.moved = false;
                drag.startX = e.clientX;
                drag.startY = e.clientY;
                const rect = panel.getBoundingClientRect();
                drag.startLeft = rect.left;
                drag.startTop = rect.top;
                toggle.setPointerCapture(e.pointerId);
            });
            toggle.addEventListener('pointermove', e => {
                if (!drag.active) return;
                const dx = e.clientX - drag.startX;
                const dy = e.clientY - drag.startY;
                if (Math.hypot(dx, dy) > 3) drag.moved = true;
                clampCalcPosition(drag.startLeft + dx, drag.startTop + dy);
            });
            toggle.addEventListener('pointerup', e => {
                if (drag.active && !drag.moved) {
                    const open = panel.getAttribute('aria-expanded') !== 'true';
                    panel.setAttribute('aria-expanded', String(open));
                    requestAnimationFrame(clampCurrentCalcPosition);
                }
                drag.active = false;
            });

            panel.querySelectorAll('.calc-key[data-insert]').forEach(btn => {
                btn.addEventListener('click', () => {
                    let text = btn.dataset.insert;
                    if (!text) return;
                    // data-display is for human-readable button labels; data-insert is inserted into the calc input.
                    void btn.dataset.display;
                    const braceMatch = text.match(/^(.*\{)(\})(.*)$/);
                    if (braceMatch && text.split('{').length === text.split('}').length) {
                        insertAtCursor(text);
                        moveCursor(-1 * (braceMatch[2].length + braceMatch[3].length));
                        return;
                    }
                    if (text === '\\frac{}{}') {
                        insertAtCursor(text);
                        moveCursor(-3);
                        return;
                    }
                    insertAtCursor(text);
                });
            });

            panel.querySelectorAll('.calc-func[data-calc]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.calc;
                    if (action === 'clear') {
                        display.value = '';
                    } else if (action === 'backspace') {
                        const start = display.selectionStart ?? display.value.length;
                        const end = display.selectionEnd ?? start;
                        if (start === end) {
                            if (start > 0) {
                                display.value = display.value.slice(0, start - 1) + display.value.slice(start);
                                display.setSelectionRange(start - 1, start - 1);
                            }
                        } else {
                            display.value = display.value.slice(0, start) + display.value.slice(end);
                            display.setSelectionRange(start, start);
                        }
                    } else if (action === 'evaluate') {
                        evaluateCalc();
                        return;
                    } else if (action === 'angle') {
                        angleMode = angleMode === 'rad' ? 'deg' : 'rad';
                        btn.textContent = angleMode === 'rad' ? 'RAD' : 'DEG';
                        btn.classList.toggle('active', angleMode === 'rad');
                        display.focus();
                        return;
                    }
                    updateCalcPreview();
                    display.focus();
                });
            });

            $('calcFill').addEventListener('click', () => {
                const fillInput = $('fillInput');
                const fillPreview = $('fillPreview');
                if (fillInput) {
                    fillInput.value = display.value;
                    if (fillPreview) {
                        if (window.katex && display.value.trim()) {
                            try { katex.render(displayLatexExpression(display.value), fillPreview, { throwOnError: false }); }
                            catch (e) { fillPreview.textContent = display.value; }
                        } else {
                            fillPreview.textContent = display.value;
                        }
                    }
                    fillInput.focus();
                }
            });

            display.addEventListener('keydown', e => {
                if (eventMatchesAction(e, 'calc-fill')) { e.preventDefault(); fillCalcToAnswer(); }
                else if (eventMatchesAction(e, 'calc-evaluate')) { e.preventDefault(); evaluateCalc(); }
                else if (eventMatchesAction(e, 'calc-clear-close')) {
                    e.preventDefault();
                    if (display.value) { display.value = ''; updateCalcPreview(); }
                    else panel.setAttribute('aria-expanded', 'false');
                }
                else if (eventMatchesAction(e, 'calc-angle')) { e.preventDefault(); toggleAngleMode(); }
                else setTimeout(updateCalcPreview, 0);
            });
            display.addEventListener('input', updateCalcPreview);
            display.addEventListener('focus', () => bringFloatingLayerToFront('calc'));
            window.addEventListener('resize', clampCurrentCalcPosition);

            updateCalcPreview();
            window.resetCalculatorPosition();
        }

        /* ============ Keyboard binding system ============ */
        const keyActionLabels = {
            'nav-stats': '统计', 'nav-bank': '题库', 'nav-fav': '收藏夹',
            'nav-settings': '设置', 'nav-focus': '专注模式', 'nav-radar': '资源雷达', 'nav-home': '返回主页', 'nav-start-quiz': '开始答题',
            'quiz-up': '答题上移', 'quiz-down': '答题下移', 'quiz-left': '答题左移', 'quiz-right': '答题右移',
            'quiz-confirm': '确认/下一题', 'quiz-cancel': '返回首页',
            'calc-toggle': '开关计算器', 'sound-toggle': '开关声音',
            'fav-toggle': '收藏本题', 'export-question': '导出题目', 'close-modal': '关闭弹窗'
        };
        Object.assign(keyActionLabels, {
            'wb-pen': '\u8349\u7a3f\u753b\u7b14', 'wb-line': '\u8349\u7a3f\u76f4\u7ebf', 'wb-circle': '\u8349\u7a3f\u5706\u5f62', 'wb-eraser': '\u8349\u7a3f\u6a61\u76ae',
            'wb-size-down': '\u7b14\u7c97\u51cf\u5c0f', 'wb-size-up': '\u7b14\u7c97\u589e\u5927', 'wb-clear': '\u6e05\u7a7a\u8349\u7a3f',
            'calc-evaluate': '\u8ba1\u7b97\u5668\u8ba1\u7b97', 'calc-backspace': '\u8ba1\u7b97\u5668\u9000\u683c', 'calc-clear-close': '\u8ba1\u7b97\u5668\u6e05\u7a7a/\u5173\u95ed', 'calc-angle': '\u89d2\u5ea6/\u5f27\u5ea6', 'calc-fill': '\u586b\u5165\u7b54\u6848',
            'bank-search': '\u9898\u5e93\u641c\u7d22', 'bank-prev': '\u9898\u5e93\u4e0a\u4e00\u9875', 'bank-next': '\u9898\u5e93\u4e0b\u4e00\u9875',
            'bank-first': '\u9898\u5e93\u9996\u9875', 'bank-last': '\u9898\u5e93\u672b\u9875', 'bank-filter': '\u9898\u5e93\u7b5b\u9009', 'bank-enter-preview': '\u9884\u89c8\u9ad8\u4eae\u9898', 'bank-start-preview': '\u8fdb\u5165\u9884\u89c8\u9898',
            'graph-zoom-in': '\u56fe\u8c31\u653e\u5927', 'graph-zoom-out': '\u56fe\u8c31\u7f29\u5c0f', 'graph-node-detail': '\u67e5\u770b\u8282\u70b9', 'graph-cancel': '\u53d6\u6d88\u56fe\u8c31\u9009\u4e2d'
        });

        function formatKeyCap(key) {
            if (!key) return '—';
            const map = { ' ': 'Space', 'ArrowUp': '↑', 'ArrowDown': '↓', 'ArrowLeft': '←', 'ArrowRight': '→', 'Enter': '↵', 'Escape': 'Esc', 'Backspace': '⌫' };
            if (map[key]) return map[key];
            return key.length === 1 ? key.toUpperCase() : key;
        }

        function normalizeKeyName(key) {
            if (!key) return '';
            const parts = String(key).split('+').map(x => x.trim()).filter(Boolean);
            const main = parts.pop() || '';
            const mods = parts.map(x => x.toLowerCase());
            const ordered = [];
            if (mods.includes('ctrl') || mods.includes('control')) ordered.push('Ctrl');
            if (mods.includes('alt')) ordered.push('Alt');
            if (mods.includes('shift')) ordered.push('Shift');
            if (mods.includes('meta') || mods.includes('cmd')) ordered.push('Meta');
            ordered.push(main.length === 1 ? main.toLowerCase() : main);
            return ordered.join('+');
        }

        function eventKeyName(event) {
            const main = event.key.length === 1 ? event.key.toLowerCase() : event.key;
            const mods = [];
            if (event.ctrlKey) mods.push('Ctrl');
            if (event.altKey) mods.push('Alt');
            if (event.shiftKey && !main.startsWith('Arrow')) mods.push('Shift');
            if (event.metaKey) mods.push('Meta');
            mods.push(main);
            return normalizeKeyName(mods.join('+'));
        }

        function actionKey(action) {
            return normalizeKeyName(settings.keyboard.bindings[action] || '');
        }

        function isActionDisabled(action) {
            return settings.keyboard.disabled.includes(action);
        }

        function eventMatchesAction(event, action) {
            if (isActionDisabled(action)) return false;
            return eventKeyName(event) === actionKey(action);
        }

        function keyActionScope(action) {
            if (action.startsWith('wb-')) return 'whiteboard';
            if (action.startsWith('bank-')) return 'bank';
            if (action.startsWith('graph-')) return 'graph';
            if (action.startsWith('calc-') && action !== 'calc-toggle') return 'calculator';
            if (action.startsWith('quiz-') || ['fav-toggle', 'export-question'].includes(action)) return 'quiz';
            return 'global';
        }

        function renderKeyboardBindings() {
            const container = $('keyboardBindings');
            if (!container) return;
            container.closest('.settings-group')?.classList.add('keyboard-settings-group');
            const groups = [
                { title: '\u5bfc\u822a\u7c7b', actions: ['nav-stats', 'nav-bank', 'nav-fav', 'nav-settings', 'nav-focus', 'nav-radar', 'nav-home', 'nav-start-quiz'] },
                { title: '\u7b54\u9898\u7c7b', actions: ['quiz-up', 'quiz-down', 'quiz-left', 'quiz-right', 'quiz-confirm', 'quiz-cancel'] },
                { title: '\u5de5\u5177\u7c7b', actions: ['calc-toggle', 'sound-toggle', 'fav-toggle', 'export-question', 'close-modal'] },
                { title: '\u8349\u7a3f\u7eb8', actions: ['wb-pen', 'wb-line', 'wb-circle', 'wb-eraser', 'wb-size-down', 'wb-size-up', 'wb-clear'] },
                { title: '\u8ba1\u7b97\u5668', actions: ['calc-evaluate', 'calc-backspace', 'calc-clear-close', 'calc-angle', 'calc-fill'] },
                { title: '\u9898\u5e93', actions: ['bank-search', 'bank-prev', 'bank-next', 'bank-first', 'bank-last', 'bank-filter', 'bank-enter-preview', 'bank-start-preview'] },
                { title: '\u77e5\u8bc6\u56fe\u8c31', actions: ['graph-zoom-in', 'graph-zoom-out', 'graph-node-detail', 'graph-cancel'] }
            ];
            const renderGroup = group => {
                const rows = group.actions.map(action => {
                    const key = settings.keyboard.bindings[action];
                    const label = keyActionLabels[action] || action;
                    const isDisabled = settings.keyboard.disabled.includes(action);
                    return `<div class="kb-row">
                        <label>${escapeHtml(label)}</label>
                        <span class="key-cap${isDisabled ? ' disabled' : ''}" data-action="${action}" tabindex="0">${formatKeyCap(key)}</span>
                        <button class="key-disable-toggle${isDisabled ? ' disabled' : ''}" data-action="${action}">${isDisabled ? '\u5df2\u7981\u7528' : '\u542f\u7528\u4e2d'}</button>
                    </div>`;
                }).join('');
                return `<div class="kb-group"><div class="kb-group-title">${group.title}</div>${rows}</div>`;
            };
            const columns = [
                groups.slice(0, 4),
                groups.slice(4)
            ];
            container.innerHTML = columns.map(column =>
                `<div class="kb-column">${column.map(renderGroup).join('')}</div>`
            ).join('');
        }
        let kbBindingAction = null;

        function startKeyBinding(action) {
            kbBindingAction = action;
            const cap = document.querySelector(`.key-cap[data-action="${action}"]`);
            if (cap) {
                cap.classList.add('binding');
                cap.textContent = '按下按键...';
            }
        }

        function finishKeyBinding(newKey) {
            if (!kbBindingAction) return;
            const action = kbBindingAction;
            kbBindingAction = null;
            newKey = normalizeKeyName(newKey);
            // 检查冲突：不允许重复绑定
            const conflict = Object.entries(settings.keyboard.bindings).find(
                ([a, k]) => a !== action && normalizeKeyName(k) === newKey && keyActionScope(a) === keyActionScope(action)
            );
            if (conflict) {
                const conflictLabel = keyActionLabels[conflict[0]] || conflict[0];
                alert(`键位 "${formatKeyCap(newKey)}" 已被「${conflictLabel}」占用，无法重复绑定。`);
                renderKeyboardBindings();
                return;
            }
            settings.keyboard.bindings[action] = newKey;
            saveData();
            renderKeyboardBindings();
        }

        function cancelKeyBinding() {
            if (!kbBindingAction) return;
            kbBindingAction = null;
            renderKeyboardBindings();
        }

        function setWhiteboardTool(tool) {
            const btn = document.querySelector(`.wb-tool[data-tool="${tool}"]`);
            if (btn) btn.click();
        }

        function adjustWhiteboardSize(delta) {
            const input = $('wbSize');
            if (!input) return false;
            const min = Number(input.min || 1);
            const max = Number(input.max || 20);
            const value = Math.max(min, Math.min(max, Number(input.value || wb.size || 3) + delta));
            input.value = String(value);
            wb.size = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
        }

        function handleWhiteboardShortcut(event) {
            if (!document.body.classList.contains('quiz-active') || !$('whiteboard')) return false;
            const map = { 'wb-pen': 'pen', 'wb-line': 'line', 'wb-circle': 'circle', 'wb-eraser': 'eraser' };
            const toolAction = Object.keys(map).find(action => eventMatchesAction(event, action));
            if (toolAction) {
                event.preventDefault();
                setWhiteboardTool(map[toolAction]);
                return true;
            }
            if (eventMatchesAction(event, 'wb-size-down') || eventMatchesAction(event, 'wb-size-up')) {
                event.preventDefault();
                return adjustWhiteboardSize(eventMatchesAction(event, 'wb-size-down') ? -1 : 1);
            }
            if (eventMatchesAction(event, 'wb-clear')) {
                event.preventDefault();
                clearWhiteboard(!!settings.clearConfirm);
                return true;
            }
            return false;
        }

        function handleCalculatorShortcut(event) {
            const calc = window.focusMathCalc;
            if (!calc) return false;
            const panel = $('calcPanel');
            const activeInCalc = panel?.contains(document.activeElement);
            if (!activeInCalc) return false;
            if (eventMatchesAction(event, 'calc-fill')) {
                event.preventDefault();
                calc.fill();
                return true;
            }
            if (eventMatchesAction(event, 'calc-evaluate')) {
                event.preventDefault();
                calc.evaluate();
                return true;
            }
            if (eventMatchesAction(event, 'calc-backspace')) {
                event.preventDefault();
                calc.backspace();
                return true;
            }
            if (eventMatchesAction(event, 'calc-clear-close')) {
                event.preventDefault();
                if (calc.hasValue()) calc.clear();
                else panel.setAttribute('aria-expanded', 'false');
                return true;
            }
            if (eventMatchesAction(event, 'calc-angle')) {
                event.preventDefault();
                calc.angle();
                return true;
            }
            if (/^[0-9+\-*/().^=]$/.test(event.key)) {
                event.preventDefault();
                calc.insert(event.key);
                return true;
            }
            return false;
        }

        function bankKeyboardGoPage(target) {
            const input = $('bankPageJump');
            const btn = $('bankPageJumpBtn');
            if (!input || !btn) return false;
            const max = Math.max(1, Number(input.max || 1));
            const next = target === 'first' ? 1 : target === 'last' ? max : Math.max(1, Math.min(max, Number(input.value || state.bankPage || 1) + target));
            input.value = String(next);
            btn.click();
            return true;
        }

        function handleBankShortcut(event) {
            if (!$('bankScreen')?.classList.contains('active')) return false;
            if (eventMatchesAction(event, 'bank-search')) {
                event.preventDefault();
                $('bankSearchInput')?.focus();
                return true;
            }
            if (eventMatchesAction(event, 'bank-prev') || eventMatchesAction(event, 'bank-next')) {
                event.preventDefault();
                return bankKeyboardGoPage(eventMatchesAction(event, 'bank-prev') ? -1 : 1);
            }
            if (eventMatchesAction(event, 'bank-first') || eventMatchesAction(event, 'bank-last')) {
                event.preventDefault();
                return bankKeyboardGoPage(eventMatchesAction(event, 'bank-first') ? 'first' : 'last');
            }
            if (eventMatchesAction(event, 'bank-filter')) {
                event.preventDefault();
                focusKeyboardTarget(document.querySelector('#bankTopicFilters .bank-topic-btn, #bankTopicFilters button, .bank-topic-btn'));
                return true;
            }
            if (eventMatchesAction(event, 'bank-start-preview')) {
                event.preventDefault();
                const btn = $('bankPreview')?.querySelector('.preview-enter:not(.preview-export)');
                if (btn) btn.click();
                return !!btn;
            }
            if (eventMatchesAction(event, 'bank-enter-preview')) {
                const focused = document.querySelector('#bankGrid .bank-btn.kb-focus');
                if (focused) { event.preventDefault(); focused.click(); return true; }
            }
            return false;
        }

        function handleTypingContextShortcut(event) {
            if (event.target?.id === 'calcDisplay') return handleCalculatorShortcut(event);
            if (event.ctrlKey && event.key === 'Enter' && $('calcPanel')?.contains(event.target)) return handleCalculatorShortcut(event);
            return false;
        }

        function handleContextShortcut(event) {
            return handleBankShortcut(event) || handleWhiteboardShortcut(event) || handleCalculatorShortcut(event);
        }

        function handleGlobalKeydown(e) {
            // Resolve any pending key binding first
            if (kbBindingAction) {
                e.preventDefault();
                e.stopPropagation();
                if (e.key === 'Escape') { cancelKeyBinding(); return; }
                finishKeyBinding(eventKeyName(e));
                return;
            }
            if (!settings.keyboard.enabled) return;
            if (e.defaultPrevented) return;
            if (trapModalTab(e)) return;
            if (e.key === 'Escape' && document.querySelector('.modal.show')) {
                e.preventDefault();
                closeActiveModalByKeyboard();
                return;
            }
            if (isTypingTarget(e.target)) {
                if (handleTypingContextShortcut(e)) return;
                return;
            }
            const pressed = eventKeyName(e);
            const inQuiz = document.body.classList.contains('quiz-active');
            // Shift+方向键：在所有界面移动鼠标光标（kb-focus 高亮），不移动选中
            if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                moveScreenCursor(e.key);
                return;
            }
            // 主页方向键光标移动（不滚动页面）
            if (screenCrosshair.selected && e.key === 'Escape') {
                e.preventDefault();
                keyboardPointerClearSelection();
                return;
            }
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                moveInteractiveSelection(e.key);
                return;
            }
            // 主页 Enter 激活光标所在元素
            if (e.key === 'Enter' || e.key === ' ') {
                if (keyboardEnterAsLeftClick()) { e.preventDefault(); return; }
            }
            if (handleContextShortcut(e)) return;
            const quizShiftRequired = !!settings.keyboard.quizShiftRequired;
            const matches = [];
            for (const [act, key] of Object.entries(settings.keyboard.bindings)) {
                if (!key) continue;
                const norm = normalizeKeyName(key);
                if (norm !== pressed || settings.keyboard.disabled.includes(act)) continue;
                // 答题修饰键：在答题界面，非 nav-* 和非 close-modal 的 action 需要 Shift
                // quiz-* 方向键/确认/取消不需要 Shift，避免与浏览器默认滚动冲突
                if (inQuiz && quizShiftRequired && !act.startsWith('nav-') && act !== 'close-modal' && !act.startsWith('quiz-')) {
                    if (!e.shiftKey) continue;
                }
                matches.push(act);
            }
            if (!matches.length) return;
            // If a modal is open, prioritize close-modal over navigation/quiz actions.
            const openModal = document.querySelector('.modal.show');
            if (openModal && matches.includes('close-modal')) {
                if (openModal.id === 'tutorialModal') closeTutorial();
                else openModal.classList.remove('show');
                return;
            }

            const tryAction = action => {
                switch (action) {
                    case 'nav-stats':
                    case 'nav-bank':
                    case 'nav-fav':
                    case 'nav-settings':
                    case 'nav-focus':
                    case 'nav-radar':
                    case 'nav-home':
                    case 'nav-start-quiz':
                        if (inQuiz) return false;
                        if (action === 'nav-home') { showScreen('homeScreen'); }
                        else if (action === 'nav-start-quiz') { openSetup('adaptive', state.subject); }
                        else {
                            const btnMap = { 'nav-stats': 'statsHeaderBtn', 'nav-bank': 'bankHeaderBtn', 'nav-fav': 'favHeaderBtn', 'nav-settings': 'settingsBtn', 'nav-focus': 'focusToggle', 'nav-radar': 'radarHeaderBtn' };
                            $(btnMap[action])?.click();
                        }
                        return true;
                    case 'quiz-up':
                    case 'quiz-down':
                    case 'quiz-left':
                    case 'quiz-right':
                        if (!inQuiz) return false;
                        e.preventDefault();
                        moveQuizSelection(action);
                        return true;
                    case 'quiz-confirm':
                        if (!inQuiz) return false;
                        e.preventDefault();
                        if (keyboardEnterAsLeftClick()) return true;
                        confirmQuizSelection();
                        return true;
                    case 'quiz-cancel':
                        if (!inQuiz) return false;
                        navigateBackByBreadcrumb();
                        return true;
                    case 'calc-toggle': {
                        // 直接操作 aria-expanded，与鼠标点击 M 按钮的 pointerup 逻辑一致
                        const panel = $('calcPanel');
                        if (panel) {
                            const open = panel.getAttribute('aria-expanded') !== 'true';
                            panel.setAttribute('aria-expanded', String(open));
                            if (open) requestAnimationFrame(() => window.focusMathCalc?.focus());
                            if (typeof clampCurrentCalcPosition === 'function') {
                                requestAnimationFrame(clampCurrentCalcPosition);
                            }
                        }
                        return true;
                    }
                    case 'sound-toggle':
                        if ($('soundToggle')) { $('soundToggle').click(); }
                        else { settings.sound.enabled = !settings.sound.enabled; applySettings(); saveData(); }
                        return true;
                    case 'fav-toggle':
                        if (!inQuiz) return false;
                        $('favToggle')?.click();
                        return true;
                    case 'export-question':
                        if (!inQuiz) return false;
                        $('exportQuestionBtn')?.click();
                        return true;
                    case 'close-modal': {
                        const open = document.querySelector('.modal.show');
                        if (open) {
                            if (open.id === 'tutorialModal') closeTutorial();
                            else open.classList.remove('show');
                            return true;
                        }
                        // 无弹窗时根据面包屑退回上一级
                        return navigateBackByBreadcrumb();
                    }
                }
                return false;
            };
            for (const action of matches) {
                if (tryAction(action)) break;
            }
        }

        function getQuizChoiceColumns() {
            const grid = $('choicesGrid');
            if (!grid) return 1;
            const style = getComputedStyle(grid);
            const cols = style.gridTemplateColumns;
            if (!cols || cols === 'none') return 1;
            return cols.split(' ').filter(Boolean).length || 1;
        }

        function moveQuizSelection(direction) {
            const buttons = $$('#choicesGrid .choice-btn');
            if (!buttons.length) return;
            let current = -1;
            buttons.forEach((btn, i) => { if (btn.classList.contains('kb-focus')) current = i; });
            const cols = getQuizChoiceColumns();
            const rows = Math.ceil(buttons.length / cols);
            let row = current >= 0 ? Math.floor(current / cols) : 0;
            let col = current >= 0 ? current % cols : 0;
            if (current < 0) { current = 0; }
            else {
                if (direction === 'quiz-up') row = (row - 1 + rows) % rows;
                else if (direction === 'quiz-down') row = (row + 1) % rows;
                else if (direction === 'quiz-left') col = (col - 1 + cols) % cols;
                else if (direction === 'quiz-right') col = (col + 1) % cols;
                let next = row * cols + col;
                if (next >= buttons.length) next = current;
                current = next;
            }
            buttons.forEach(btn => btn.classList.remove('kb-focus'));
            const target = buttons[current];
            if (target && !target.disabled) target.classList.add('kb-focus');
            else if (target) target.classList.add('kb-focus');
            focusKeyboardTarget(target);
            target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }

        // 主页方向键光标移动：在 hero-btn / subject-card / quick-card 之间导航
        function getHomepageFocusableItems() {
            if (!$('homeScreen')?.classList.contains('active')) return [];
            return Array.from(document.querySelectorAll('#homeScreen .hero-btn, #homeScreen .subject-card, #homeScreen .quick-card'))
                .filter(el => el.offsetParent !== null);
        }

        function moveHomepageCursor(direction) {
            const items = getHomepageFocusableItems();
            if (!items.length) return;
            const current = items.findIndex(el => el.classList.contains('kb-focus'));
            // 按 Y 坐标分组为行
            const rows = [];
            items.forEach(el => {
                const y = Math.round(el.getBoundingClientRect().top);
                let row = rows.find(r => Math.abs(r.y - y) < 30);
                if (!row) { row = { y, items: [] }; rows.push(row); }
                row.items.push(el);
            });
            rows.sort((a, b) => a.y - b.y);
            rows.forEach(r => r.items.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left));

            let curRow = -1, curCol = -1;
            if (current >= 0) {
                for (let r = 0; r < rows.length; r++) {
                    const c = rows[r].items.indexOf(items[current]);
                    if (c >= 0) { curRow = r; curCol = c; break; }
                }
            }

            let newRow, newCol;
            if (curRow < 0) { newRow = 0; newCol = 0; }
            else {
                newRow = curRow;
                newCol = curCol;
                if (direction === 'ArrowUp') newRow = Math.max(0, curRow - 1);
                else if (direction === 'ArrowDown') newRow = Math.min(rows.length - 1, curRow + 1);
                else if (direction === 'ArrowLeft') newCol = Math.max(0, curCol - 1);
                else if (direction === 'ArrowRight') newCol = Math.min(rows[newRow].items.length - 1, curCol + 1);
            }
            // 跨行时限制列不越界
            if (newRow !== curRow && newRow >= 0 && newRow < rows.length) {
                newCol = Math.min(newCol, rows[newRow].items.length - 1);
                if (newCol < 0) newCol = 0;
            }

            const target = rows[newRow]?.items[newCol];
            if (target) {
                items.forEach(el => el.classList.remove('kb-focus'));
                target.classList.add('kb-focus');
                focusKeyboardTarget(target);
                target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }

        function confirmHomepageSelection() {
            const modal = document.querySelector('.modal.show');
            const root = modal || document.querySelector('.screen.active') || document;
            const focused = root.querySelector('.kb-focus');
            if (focused) { focused.click(); return true; }
            return false;
        }

        function interactiveSelector() {
            return [
                'button:not(:disabled)',
                'a[href]',
                'input:not([type="hidden"]):not(:disabled)',
                'select:not(:disabled)',
                'textarea:not(:disabled)',
                '[tabindex]:not([tabindex="-1"])',
                '[role="button"]',
                '.subject-card',
                '.quick-card',
                '.hero-btn',
                '.bank-item',
                '.bank-topic-btn',
                '.fav-btn',
                '.history-item.replayable',
                '.analysis-question-btn',
                '.auto-candidate',
                '.stats-sidebar-item',
                '.settings-nav button',
                '.choice-btn:not(:disabled)',
                '.icon-btn'
            ].join(',');
        }

        function getActiveInteractiveItems() {
            const modal = document.querySelector('.modal.show');
            const root = modal || document.querySelector('.screen.active') || document.body;
            const items = Array.from(root.querySelectorAll(interactiveSelector()))
                .filter(el => {
                    const rect = el.getBoundingClientRect();
                    const style = getComputedStyle(el);
                    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
                });
            return [...new Set(items)];
        }

        function moveInteractiveSelection(direction) {
            const items = getActiveInteractiveItems();
            if (!items.length) return false;
            const current = items.findIndex(el => el.classList.contains('kb-focus'));
            const currentEl = current >= 0 ? items[current] : null;
            const currentRect = currentEl?.getBoundingClientRect();
            let target = null;
            if (!currentEl) {
                target = items[0];
            } else {
                const cx = currentRect.left + currentRect.width / 2;
                const cy = currentRect.top + currentRect.height / 2;
                const candidates = items.filter(el => el !== currentEl).map(el => {
                    const rect = el.getBoundingClientRect();
                    const x = rect.left + rect.width / 2;
                    const y = rect.top + rect.height / 2;
                    const dx = x - cx;
                    const dy = y - cy;
                    const primary = direction === 'ArrowLeft' ? -dx : direction === 'ArrowRight' ? dx : direction === 'ArrowUp' ? -dy : dy;
                    const cross = direction === 'ArrowLeft' || direction === 'ArrowRight' ? Math.abs(dy) : Math.abs(dx);
                    return { el, primary, cross, dist: Math.hypot(dx, dy) };
                }).filter(item => item.primary > 4)
                  .sort((a, b) => a.cross - b.cross || a.primary - b.primary || a.dist - b.dist);
                target = candidates[0]?.el || currentEl;
            }
            if (!target) return false;
            items.forEach(el => el.classList.remove('kb-focus'));
            target.classList.add('kb-focus');
            focusKeyboardTarget(target);
            target.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
            return true;
        }

        // 通用屏幕光标移动：Shift+方向键时在当前屏幕所有可聚焦元素间移动 kb-focus
        function moveScreenCursor(direction) {
            const activeScreen = document.querySelector('.screen.active');
            if (!activeScreen) return;
            // 答题界面：直接使用 moveQuizSelection（已在 quiz 绑定中处理）
            if (activeScreen.id === 'quizScreen') {
                const map = { 'ArrowUp': 'quiz-up', 'ArrowDown': 'quiz-down', 'ArrowLeft': 'quiz-left', 'ArrowRight': 'quiz-right' };
                moveQuizSelection(map[direction]);
                return;
            }
            // 主页：使用已有的 moveHomepageCursor
            if (activeScreen.id === 'homeScreen') {
                moveHomepageCursor(direction);
                return;
            }
            // 其他屏幕：收集所有可点击/可聚焦元素，按 2D 网格导航
            const selector = 'button, a, .subject-card, .quick-card, .stat-card, .bank-card, .fav-card, .summary-card, .clickable, [role="button"], input[type="checkbox"], input[type="radio"]';
            const items = Array.from(activeScreen.querySelectorAll(selector))
                .filter(el => el.offsetParent !== null && !el.disabled && el.getBoundingClientRect().width > 0);
            if (!items.length) return;
            const current = items.findIndex(el => el.classList.contains('kb-focus'));
            const rows = [];
            items.forEach(el => {
                const y = Math.round(el.getBoundingClientRect().top);
                let row = rows.find(r => Math.abs(r.y - y) < 30);
                if (!row) { row = { y, items: [] }; rows.push(row); }
                row.items.push(el);
            });
            rows.sort((a, b) => a.y - b.y);
            rows.forEach(r => r.items.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left));
            let curRow = -1, curCol = -1;
            if (current >= 0) {
                for (let r = 0; r < rows.length; r++) {
                    const c = rows[r].items.indexOf(items[current]);
                    if (c >= 0) { curRow = r; curCol = c; break; }
                }
            }
            let newRow, newCol;
            if (curRow < 0) { newRow = 0; newCol = 0; }
            else {
                newRow = curRow;
                newCol = curCol;
                if (direction === 'ArrowUp') newRow = Math.max(0, curRow - 1);
                else if (direction === 'ArrowDown') newRow = Math.min(rows.length - 1, curRow + 1);
                else if (direction === 'ArrowLeft') newCol = Math.max(0, curCol - 1);
                else if (direction === 'ArrowRight') newCol = Math.min(rows[newRow].items.length - 1, curCol + 1);
            }
            if (newRow !== curRow && newRow >= 0 && newRow < rows.length) {
                newCol = Math.min(newCol, rows[newRow].items.length - 1);
                if (newCol < 0) newCol = 0;
            }
            const target = rows[newRow]?.items[newCol];
            if (target) {
                items.forEach(el => el.classList.remove('kb-focus'));
                target.classList.add('kb-focus');
                focusKeyboardTarget(target);
                target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }

        const screenCrosshair = { x: null, y: null, selected: null };

        function ensureScreenCrosshair() {
            let el = $('screenCrosshair');
            if (!el) {
                el = document.createElement('div');
                el.id = 'screenCrosshair';
                el.className = 'screen-crosshair keyboard-pointer';
                el.setAttribute('aria-hidden', 'true');
                document.body.appendChild(el);
            }
            if (screenCrosshair.x === null || screenCrosshair.y === null) {
                screenCrosshair.x = Math.round(window.innerWidth / 2);
                screenCrosshair.y = Math.round(window.innerHeight / 2);
            }
            return el;
        }

        function setScreenCrosshairPosition(x, y) {
            const margin = 12;
            screenCrosshair.x = Math.max(margin, Math.min(window.innerWidth - margin, x));
            screenCrosshair.y = Math.max(margin, Math.min(window.innerHeight - margin, y));
            const el = ensureScreenCrosshair();
            el.style.left = `${screenCrosshair.x}px`;
            el.style.top = `${screenCrosshair.y}px`;
            el.classList.add('show');
            el.classList.toggle('selected', !!screenCrosshair.selected);
            clearTimeout(el._hideTimer);
            el._hideTimer = setTimeout(() => el.classList.remove('show'), 1800);
        }

        function moveScreenCursor(direction) {
            keyboardPointerClearSelection();
            const step = eShiftStep();
            ensureScreenCrosshair();
            const dx = direction === 'ArrowLeft' ? -step : direction === 'ArrowRight' ? step : 0;
            const dy = direction === 'ArrowUp' ? -step : direction === 'ArrowDown' ? step : 0;
            setScreenCrosshairPosition((screenCrosshair.x ?? window.innerWidth / 2) + dx, (screenCrosshair.y ?? window.innerHeight / 2) + dy);
            scrollPageForScreenCursor(direction);
        }

        function eShiftStep() {
            return Math.max(8, Math.min(80, Number(settings.keyboard?.cursorStep) || 24));
        }

        function scrollPageForScreenCursor(direction) {
            if (direction !== 'ArrowUp' && direction !== 'ArrowDown') return;
            if (screenCrosshair.y === null) return;
            const edge = Math.max(44, Math.min(82, eShiftStep() * 2.4));
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            if (direction === 'ArrowUp' && screenCrosshair.y <= edge && window.scrollY > 0) {
                window.scrollBy({ top: -eShiftStep() * 1.8, behavior: 'auto' });
                setScreenCrosshairPosition(screenCrosshair.x ?? window.innerWidth / 2, edge);
            } else if (direction === 'ArrowDown' && screenCrosshair.y >= window.innerHeight - edge && window.scrollY < maxScroll) {
                window.scrollBy({ top: eShiftStep() * 1.8, behavior: 'auto' });
                setScreenCrosshairPosition(screenCrosshair.x ?? window.innerWidth / 2, window.innerHeight - edge);
            }
        }

        function keyboardPointerElementAt() {
            if (screenCrosshair.x === null || screenCrosshair.y === null) return null;
            const pointer = $('screenCrosshair');
            const oldDisplay = pointer ? pointer.style.display : '';
            if (pointer) pointer.style.display = 'none';
            const raw = document.elementFromPoint(screenCrosshair.x, screenCrosshair.y);
            if (pointer) pointer.style.display = oldDisplay;
            return raw?.closest?.(interactiveSelector()) || null;
        }

        function keyboardPointerClearSelection() {
            if (screenCrosshair.selected) screenCrosshair.selected.classList.remove('keyboard-pointer-selected');
            screenCrosshair.selected = null;
            $('screenCrosshair')?.classList.remove('selected');
        }

        function dispatchKeyboardMouseClick(target, point = null) {
            if (!target) return false;
            const rect = target.getBoundingClientRect?.();
            const x = point?.x ?? (screenCrosshair.x !== null ? screenCrosshair.x : Math.round((rect?.left || 0) + (rect?.width || 0) / 2));
            const y = point?.y ?? (screenCrosshair.y !== null ? screenCrosshair.y : Math.round((rect?.top || 0) + (rect?.height || 0) / 2));
            const base = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, button: 0, buttons: 1 };
            try {
                target.dispatchEvent(new PointerEvent('pointerdown', { ...base, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
                target.dispatchEvent(new MouseEvent('mousedown', base));
                target.dispatchEvent(new PointerEvent('pointerup', { ...base, buttons: 0, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
                target.dispatchEvent(new MouseEvent('mouseup', { ...base, buttons: 0 }));
                target.dispatchEvent(new MouseEvent('click', { ...base, buttons: 0 }));
            } catch (_) {
                target.click?.();
            }
            return true;
        }

        function isTypingTarget(target = document.activeElement) {
            const tag = target?.tagName;
            return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable;
        }

        function focusKeyboardTarget(target) {
            if (!target || typeof target.focus !== 'function') return;
            const tag = target.tagName;
            const naturallyFocusable = /^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(tag) || target.hasAttribute('tabindex');
            if (!naturallyFocusable) target.setAttribute('tabindex', '-1');
            try { target.focus({ preventScroll: true }); } catch (_) { target.focus(); }
        }

        let modalReturnFocus = null;
        function modalFocusableItems(modal) {
            if (!modal) return [];
            return Array.from(modal.querySelectorAll(interactiveSelector()))
                .filter(el => {
                    const rect = el.getBoundingClientRect();
                    const style = getComputedStyle(el);
                    return rect.width > 0 && rect.height > 0 && !el.disabled && style.visibility !== 'hidden' && style.display !== 'none';
                });
        }

        function focusFirstModalControl(modal) {
            const items = modalFocusableItems(modal);
            focusKeyboardTarget(items[0] || modal.querySelector('.modal-content') || modal);
        }

        function closeActiveModalByKeyboard() {
            const modal = document.querySelector('.modal.show');
            if (!modal) return false;
            if (modal.id === 'tutorialModal' && typeof closeTutorial === 'function') closeTutorial();
            else modal.classList.remove('show');
            const target = modalReturnFocus;
            modalReturnFocus = null;
            requestAnimationFrame(() => focusKeyboardTarget(target));
            return true;
        }

        function trapModalTab(event) {
            const modal = document.querySelector('.modal.show');
            if (!modal || event.key !== 'Tab') return false;
            const items = modalFocusableItems(modal);
            if (!items.length) return false;
            const current = document.activeElement;
            let index = items.indexOf(current);
            if (index < 0) index = event.shiftKey ? 0 : -1;
            const next = items[(index + (event.shiftKey ? -1 : 1) + items.length) % items.length];
            event.preventDefault();
            focusKeyboardTarget(next);
            return true;
        }

        function initModalKeyboardSupport() {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    const el = mutation.target;
                    if (!(el instanceof HTMLElement) || !el.classList.contains('modal')) return;
                    if (el.classList.contains('show')) {
                        modalReturnFocus = document.activeElement;
                        requestAnimationFrame(() => focusFirstModalControl(el));
                    }
                });
            });
            $$('.modal').forEach(modal => observer.observe(modal, { attributes: true, attributeFilter: ['class'] }));
        }

        function keyboardPointerConfirm() {
            const target = keyboardPointerElementAt();
            if (!target) return false;
            keyboardPointerClearSelection();
            target.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
            return dispatchKeyboardMouseClick(target, { x: screenCrosshair.x ?? Math.round(window.innerWidth / 2), y: screenCrosshair.y ?? Math.round(window.innerHeight / 2) });
        }

        function keyboardEnterAsLeftClick() {
            const pointerVisible = $('screenCrosshair')?.classList.contains('show');
            if (pointerVisible && screenCrosshair.x !== null && screenCrosshair.y !== null) return keyboardPointerConfirm();
            const modal = document.querySelector('.modal.show');
            const root = modal || document.querySelector('.screen.active') || document;
            const focused = root.querySelector('.kb-focus');
            if (!focused) return false;
            focused.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
            focusKeyboardTarget(focused);
            const rect = focused.getBoundingClientRect();
            return dispatchKeyboardMouseClick(focused, {
                x: Math.round(rect.left + rect.width / 2),
                y: Math.round(rect.top + rect.height / 2)
            });
        }

        function confirmQuizSelection() {
            // 两步式确认：先选中，再确定
            const focused = document.querySelector('#choicesGrid .choice-btn.kb-focus');
            if (focused && !focused.disabled) { focused.click(); return; }
            // 无选中项时，先选中第一个可选项（不直接确认）
            const buttons = $$('#choicesGrid .choice-btn');
            const firstEnabled = Array.from(buttons).find(b => !b.disabled);
            if (firstEnabled) {
                buttons.forEach(b => b.classList.remove('kb-focus'));
                firstEnabled.classList.add('kb-focus');
                focusKeyboardTarget(firstEnabled);
                firstEnabled.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                return;
            }
            // 所有选项已禁用（已作答）或无选项时，回退到下一题按钮
            const nextBtn = $('nextBtn');
            if (nextBtn && nextBtn.classList.contains('show')) { nextBtn.click(); }
        }

        /* ============ AI 苏格拉底学习教练 ============ */
        const coachState = {
            questionId: null,
            hintLevel: 0,
            attemptCount: 0,
            startTime: 0,
            timerId: null,
            isOpen: false,
            waitingRetry: false
        };

        const coachLevelNames = ['线索', '思路', '步骤', '完整解析'];

        // 本地提示模板（离线降级）
        const coachLocalHints = {
            '微积分': {
                1: '想想导数描述的是什么？它和变化率有什么关系。',
                2: '这道题涉及求导，试着回忆相关的求导法则。',
                3: '观察函数结构，看看是否需要链式法则或乘积法则。',
                4: '先确定外层函数和内层函数，分别求导后相乘。注意常见错误：忘记内层函数的导数。'
            },
            '线性代数': {
                1: '想想矩阵的秩描述了什么？它和线性无关有什么关系。',
                2: '这道题可以用初等行变换来化简矩阵。',
                3: '将矩阵化为行最简形，非零行的数量就是秩。',
                4: '对矩阵做初等行变换化为阶梯形，非零行数即为秩。注意：行变换不改变矩阵的秩。'
            },
            '概率论': {
                1: '想想概率的基本性质是什么？总概率应该等于多少。',
                2: '这道题可以用全概率公式或贝叶斯公式来解。',
                3: '先确定所有可能的情况，再分别计算概率。',
                4: '列出样本空间，计算有利事件数与总事件数的比值。注意互斥事件和独立事件的区别。'
            }
        };

        const coachGenericHints = {
            1: '再仔细读一遍题目，找出已知条件和所求之间的关系。',
            2: '试着回忆这个知识点对应的核心方法或公式。',
            3: '列出关键步骤，看看哪一步卡住了。',
            4: '从已知条件出发，逐步推导到所求结果。检查每一步的依据是否充分。'
        };

        function getCoachHint(question, level) {
            // 尝试匹配学科模板
            const subject = state.subject || '';
            let templates = null;
            if (subject === 'calculus') templates = coachLocalHints['微积分'];
            else if (subject === 'linear') templates = coachLocalHints['线性代数'];
            else if (subject === 'probability') templates = coachLocalHints['概率论'];
            if (templates && templates[level]) return templates[level];
            return coachGenericHints[level] || coachGenericHints[1];
        }

        function startCoachTimer() {
            coachState.startTime = Date.now();
            clearInterval(coachState.timerId);
            const update = () => {
                const elapsed = Math.floor((Date.now() - coachState.startTime) / 1000);
                const m = Math.floor(elapsed / 60);
                const s = elapsed % 60;
                const el = $('coachTimer');
                if (el) el.textContent = `思考时间 ${m}:${String(s).padStart(2, '0')}`;
            };
            update();
            coachState.timerId = setInterval(update, 1000);
        }

        function stopCoachTimer() {
            clearInterval(coachState.timerId);
            coachState.timerId = null;
        }

        function resetCoachForQuestion() {
            coachState.questionId = state.sessionQuestions[state.currentQuestionIndex]?.id || null;
            coachState.hintLevel = 0;
            coachState.attemptCount = 0;
            coachState.waitingRetry = false;
            startCoachTimer();
            renderCoachUI();
        }

        function renderCoachUI() {
            const meta = $('coachMeta');
            if (meta) meta.textContent = `提示级别 ${coachState.hintLevel} / 4`;
            const content = $('coachContent');
            const trigger = $('coachTriggerBtn');
            const retryRow = $('coachRetryRow');
            if (!content || !trigger || !retryRow) return;

            if (coachState.hintLevel === 0) {
                content.innerHTML = '<div class="coach-empty">点击下方按钮获取提示。<br>每次提示后需再试一次，才能要下一级。</div>';
                trigger.style.display = '';
                trigger.textContent = '需要一点思路';
                trigger.disabled = false;
                retryRow.style.display = 'none';
            } else if (coachState.hintLevel >= 4) {
                trigger.style.display = 'none';
                retryRow.style.display = 'none';
            } else {
                trigger.style.display = coachState.waitingRetry ? 'none' : '';
                trigger.textContent = `获取第 ${coachState.hintLevel + 1} 级提示`;
                trigger.disabled = false;
                retryRow.style.display = coachState.waitingRetry ? 'flex' : 'none';
            }
        }

        function showCoachHint(level) {
            const question = state.sessionQuestions[state.currentQuestionIndex];
            if (!question) return;
            const hint = getCoachHint(question, level);
            const content = $('coachContent');
            if (!content) return;
            const levelName = coachLevelNames[level - 1] || '提示';
            const bubble = document.createElement('div');
            bubble.className = 'coach-hint-bubble';
            bubble.innerHTML = `<span class="coach-hint-level-tag">L${level} ${levelName}</span><div>${hint}</div>`;
            content.innerHTML = '';
            content.appendChild(bubble);
        }

        function onCoachTrigger() {
            if (coachState.hintLevel >= 4) return;
            coachState.hintLevel++;
            coachState.attemptCount++;
            showCoachHint(coachState.hintLevel);
            if (coachState.hintLevel < 4) {
                coachState.waitingRetry = true;
            }
            renderCoachUI();
        }

        function onCoachRetry() {
            coachState.waitingRetry = false;
            renderCoachUI();
        }

        const coachHintCache = new Map();
        const coachBetterLevelNames = ['\u7ebf\u7d22', '\u601d\u8def', '\u6b65\u9aa4', '\u5b8c\u6574\u89e3\u6790'];
        const coachTopicProfiles = [
            { match: ['\u6781\u9650', '\u65e0\u7a77\u5c0f'], core: '\u5148\u5224\u65ad\u6781\u9650\u578b\u522b\uff0c\u518d\u9009\u62e9\u7b49\u4ef7\u4ee3\u6362\u3001\u5939\u903c\u3001\u5355\u8c03\u6709\u754c\u6216\u6d1b\u5fc5\u8fbe\u6cd5\u5219\u3002', avoid: '\u4e0d\u8981\u5728\u52a0\u51cf\u7ed3\u6784\u4e2d\u968f\u610f\u7528\u7b49\u4ef7\u65e0\u7a77\u5c0f\u66ff\u6362\u6574\u9879\u3002' },
            { match: ['\u5bfc\u6570', '\u5fae\u5206', '\u4e2d\u503c\u5b9a\u7406', '\u6d1b\u5fc5\u8fbe', '\u5355\u8c03', '\u6781\u503c'], core: '\u628a\u9898\u76ee\u4e2d\u7684\u53d8\u5316\u7387\u3001\u5207\u7ebf\u3001\u5355\u8c03\u6216\u6781\u503c\u6761\u4ef6\u8f6c\u6210\u5bfc\u6570\u4fe1\u606f\u3002', avoid: '\u6ce8\u610f\u5b9a\u4e49\u57df\u548c\u7aef\u70b9\uff0c\u4e2d\u503c\u5b9a\u7406\u5148\u6838\u5bf9\u8fde\u7eed\u4e0e\u53ef\u5bfc\u6761\u4ef6\u3002' },
            { match: ['\u79ef\u5206', '\u5b9a\u79ef\u5206', '\u4e0d\u5b9a\u79ef\u5206', '\u53cd\u5e38\u79ef\u5206'], core: '\u5148\u770b\u88ab\u79ef\u51fd\u6570\u7ed3\u6784\uff0c\u5728\u6362\u5143\u3001\u5206\u90e8\u3001\u5bf9\u79f0\u6027\u548c\u79ef\u5206\u4e0a\u9650\u51fd\u6570\u4e4b\u95f4\u9009\u65b9\u6cd5\u3002', avoid: '\u5b9a\u79ef\u5206\u6362\u5143\u540e\u522b\u5fd8\u4e86\u540c\u6b65\u6539\u53d8\u79ef\u5206\u9650\u3002' },
            { match: ['\u7ea7\u6570', '\u6536\u655b', '\u5e42\u7ea7\u6570'], core: '\u5148\u533a\u5206\u5e38\u6570\u9879\u7ea7\u6570\u548c\u5e42\u7ea7\u6570\uff0c\u518d\u7528\u6bd4\u503c\u3001\u6839\u503c\u3001\u6bd4\u8f83\u6216\u7aef\u70b9\u68c0\u9a8c\u3002', avoid: '\u5e42\u7ea7\u6570\u7684\u6536\u655b\u534a\u5f84\u4e0d\u7b49\u4e8e\u6536\u655b\u57df\uff0c\u7aef\u70b9\u8981\u5355\u72ec\u5224\u65ad\u3002' },
            { match: ['\u504f\u5bfc', '\u591a\u5143', '\u91cd\u79ef\u5206', '\u66f2\u7ebf', '\u66f2\u9762'], core: '\u5148\u786e\u5b9a\u51e0\u4f55\u5bf9\u8c61\u548c\u53d8\u91cf\u8303\u56f4\uff0c\u518d\u9009\u5750\u6807\u7cfb\u3001\u79ef\u5206\u6b21\u5e8f\u6216\u76f8\u5e94\u516c\u5f0f\u3002', avoid: '\u91cd\u79ef\u5206\u7684\u533a\u57df\u8fb9\u754c\u548c\u66f2\u7ebf/\u66f2\u9762\u7684\u65b9\u5411\u5f88\u5bb9\u6613\u51fa\u9519\u3002' },
            { match: ['\u5fae\u5206\u65b9\u7a0b'], core: '\u5148\u8bc6\u522b\u65b9\u7a0b\u7c7b\u578b\uff1a\u53ef\u5206\u79bb\u53d8\u91cf\u3001\u4e00\u9636\u7ebf\u6027\u3001\u9f50\u6b21\u6216\u53ef\u964d\u9636\u3002', avoid: '\u901a\u89e3\u4e2d\u4efb\u610f\u5e38\u6570\u4e0d\u8981\u5728\u4ee3\u5165\u521d\u503c\u524d\u4e22\u6389\u3002' },
            { match: ['\u884c\u5217\u5f0f'], core: '\u5148\u89c2\u5bdf\u884c\u5217\u5173\u7cfb\uff0c\u5c3d\u91cf\u7528\u521d\u7b49\u53d8\u6362\u3001\u5c55\u5f00\u6216\u4f59\u5b50\u5f0f\u964d\u4f4e\u8ba1\u7b97\u91cf\u3002', avoid: '\u884c\u5217\u5f0f\u884c\u53d8\u6362\u4e0e\u77e9\u9635\u884c\u53d8\u6362\u7684\u500d\u4e58\u89c4\u5219\u4e0d\u5b8c\u5168\u76f8\u540c\u3002' },
            { match: ['\u77e9\u9635', '\u9006\u77e9\u9635', '\u79e9'], core: '\u628a\u95ee\u9898\u8f6c\u6210\u521d\u7b49\u53d8\u6362\u540e\u7684\u79e9\u3001\u53ef\u9006\u6027\u6216\u7b49\u4ef7\u77e9\u9635\u4fe1\u606f\u3002', avoid: '\u521d\u7b49\u884c\u53d8\u6362\u4e0d\u4fdd\u6301\u7279\u5f81\u503c\uff0c\u4f46\u4fdd\u6301\u77e9\u9635\u7684\u79e9\u3002' },
            { match: ['\u5411\u91cf', '\u65b9\u7a0b\u7ec4', '\u7ebf\u6027\u7a7a\u95f4'], core: '\u628a\u7ebf\u6027\u8868\u793a\u3001\u65e0\u5173\u6027\u548c\u89e3\u7684\u7ed3\u6784\u7edf\u4e00\u5230\u77e9\u9635\u7684\u79e9\u548c\u57fa\u7840\u89e3\u7cfb\u4e0a\u3002', avoid: '\u975e\u9f50\u6b21\u65b9\u7a0b\u7ec4\u7684\u901a\u89e3\u662f\u7279\u89e3\u52a0\u9f50\u6b21\u901a\u89e3\u3002' },
            { match: ['\u7279\u5f81\u503c', '\u76f8\u4f3c', '\u5bf9\u89d2\u5316'], core: '\u5148\u5199\u7279\u5f81\u591a\u9879\u5f0f\uff0c\u518d\u770b\u7279\u5f81\u5411\u91cf\u4e2a\u6570\u662f\u5426\u8db3\u591f\u652f\u6301\u5bf9\u89d2\u5316\u3002', avoid: '\u6709\u91cd\u7279\u5f81\u503c\u65f6\uff0c\u8981\u6bd4\u8f83\u4ee3\u6570\u91cd\u6570\u548c\u51e0\u4f55\u91cd\u6570\u3002' },
            { match: ['\u4e8c\u6b21\u578b', '\u6b63\u5b9a'], core: '\u5173\u952e\u662f\u5316\u4e3a\u6807\u51c6\u5f62\u6216\u7528\u987a\u5e8f\u4e3b\u5b50\u5f0f\u5224\u65ad\u6b63\u5b9a\u6027\u3002', avoid: '\u5408\u540c\u53d8\u6362\u548c\u76f8\u4f3c\u53d8\u6362\u4e0d\u662f\u4e00\u56de\u4e8b\u3002' },
            { match: ['\u6982\u7387', '\u6761\u4ef6\u6982\u7387', '\u72ec\u7acb', '\u8d1d\u53f6\u65af'], core: '\u5148\u5199\u6e05\u6837\u672c\u7a7a\u95f4\u3001\u4e8b\u4ef6\u548c\u6761\u4ef6\uff0c\u518d\u5224\u65ad\u7528\u4e58\u6cd5\u516c\u5f0f\u3001\u5168\u6982\u7387\u6216\u8d1d\u53f6\u65af\u516c\u5f0f\u3002', avoid: '\u4e92\u65a5\u548c\u72ec\u7acb\u6982\u5ff5\u4e0d\u8981\u6df7\u7528\u3002' },
            { match: ['\u968f\u673a\u53d8\u91cf', '\u5206\u5e03', '\u5e38\u89c1\u5206\u5e03'], core: '\u5148\u5224\u65ad\u662f\u79bb\u6563\u578b\u8fd8\u662f\u8fde\u7eed\u578b\uff0c\u518d\u4ece\u5206\u5e03\u5f8b\u3001\u5206\u5e03\u51fd\u6570\u6216\u5bc6\u5ea6\u51fd\u6570\u5165\u624b\u3002', avoid: '\u5bc6\u5ea6\u51fd\u6570\u7684\u503c\u4e0d\u662f\u6982\u7387\uff0c\u533a\u95f4\u6982\u7387\u8981\u79ef\u5206\u3002' },
            { match: ['\u671f\u671b', '\u65b9\u5dee', '\u534f\u65b9\u5dee'], core: '\u5148\u5199\u51fa\u5206\u5e03\u6216\u5bc6\u5ea6\uff0c\u518d\u4f7f\u7528\u671f\u671b\u3001\u65b9\u5dee\u548c\u534f\u65b9\u5dee\u7684\u5b9a\u4e49\u6216\u5e38\u7528\u6027\u8d28\u3002', avoid: '\u65b9\u5dee\u662f E(X^2)-[E(X)]^2\uff0c\u4e0d\u662f E(X-E(X))\u3002' },
            { match: ['\u5927\u6570\u5b9a\u5f8b', '\u4e2d\u5fc3\u6781\u9650'], core: '\u5148\u786e\u5b9a\u6837\u672c\u72ec\u7acb\u540c\u5206\u5e03\u548c\u671f\u671b\u65b9\u5dee\u6761\u4ef6\uff0c\u518d\u505a\u6807\u51c6\u5316\u6216\u6781\u9650\u8f6c\u6362\u3002', avoid: '\u4e2d\u5fc3\u6781\u9650\u5b9a\u7406\u7528\u7684\u662f\u6807\u51c6\u5316\u540e\u7684\u548c\u6216\u5747\u503c\u3002' },
            { match: ['\u4f30\u8ba1', '\u7f6e\u4fe1\u533a\u95f4', '\u5047\u8bbe\u68c0\u9a8c'], core: '\u5148\u660e\u786e\u672a\u77e5\u53c2\u6570\u3001\u7edf\u8ba1\u91cf\u548c\u62bd\u6837\u5206\u5e03\uff0c\u518d\u9009\u70b9\u4f30\u8ba1\u3001\u533a\u95f4\u4f30\u8ba1\u6216\u68c0\u9a8c\u7edf\u8ba1\u91cf\u3002', avoid: '\u663e\u8457\u6027\u6c34\u5e73\u3001\u62d2\u7edd\u57df\u548c p \u503c\u7684\u65b9\u5411\u8981\u4e00\u81f4\u3002' }
        ];

        function coachQuestionInfo(question) {
            const q = normalizeQuizQuestion(question, question.subject || state.subject);
            const info = classifyQuestion(q);
            return {
                q,
                subject: q.subject || state.subject,
                subjectName: getSubjectName(q.subject || state.subject),
                topic: info.topic || '',
                keywords: Array.isArray(info.keywords) ? info.keywords : [],
                text: `${q.question || ''} ${(q.options || []).join(' ')} ${q.explanation || ''}`
            };
        }

        function coachProfileFor(info) {
            const haystack = `${info.topic} ${info.keywords.join(' ')} ${info.text}`;
            return coachTopicProfiles.find(profile => profile.match.some(word => haystack.includes(word))) || {
                core: '\u5148\u628a\u9898\u5e72\u4e2d\u7684\u5df2\u77e5\u6761\u4ef6\u3001\u76ee\u6807\u548c\u53ef\u7528\u5b9a\u7406\u5206\u5f00\uff0c\u518d\u9009\u6700\u77ed\u7684\u89e3\u9898\u8def\u5f84\u3002',
                avoid: '\u4e0d\u8981\u6025\u7740\u4ee3\u5165\u8ba1\u7b97\uff0c\u5148\u5224\u65ad\u9898\u578b\u548c\u6761\u4ef6\u662f\u5426\u5339\u914d\u3002'
            };
        }

        function localCoachHint(question, level) {
            const info = coachQuestionInfo(question);
            const profile = coachProfileFor(info);
            const signals = extractMathSignals(info.text);
            const formulaHint = signals.length ? `\u53ef\u5148\u5199\u51fa ${signals[0].name}\uff1a$${signals[0].formula}$\u3002` : '';
            const keys = info.keywords.length ? `\u5173\u952e\u8bcd\uff1a${info.keywords.slice(0, 3).join('\u3001')}\u3002` : '';
            const topic = info.topic || '\u672c\u9898';
            if (level === 1) return `\u5148\u522b\u7b97\u3002\u8fd9\u9898\u66f4\u50cf\u300c${topic}\u300d\uff0c${keys}${formulaHint}\u8bf7\u5148\u627e\u51fa\u9898\u5e72\u8981\u4f60\u6c42\u7684\u91cf\u3002`;
            if (level === 2) return `${profile.core} ${formulaHint}\u628a\u76f8\u5173\u516c\u5f0f\u6216\u5b9a\u7406\u5199\u5728\u65c1\u8fb9\uff0c\u770b\u54ea\u4e2a\u6761\u4ef6\u6b63\u597d\u80fd\u5bf9\u4e0a\u3002`;
            if (level === 3) return `\u5efa\u8bae\u6b65\u9aa4\uff1a1. \u6807\u51fa\u5df2\u77e5\u6761\u4ef6\uff1b2. \u9009\u62e9\u300c${topic}\u300d\u7684\u4e3b\u65b9\u6cd5\uff1b3. ${formulaHint || '\u5148\u505a\u7b26\u53f7\u5316\u63a8\u5bfc\uff0c'}\u6700\u540e\u518d\u7b97\u6570\u503c\u3002`;
            return `${profile.core} ${profile.avoid} \u5b8c\u6574\u89e3\u65f6\u8bf7\u6309\u201c\u6761\u4ef6\u8bc6\u522b -> \u65b9\u6cd5\u9009\u62e9 -> \u4ee3\u5165\u63a8\u5bfc -> \u68c0\u67e5\u7ed3\u8bba\u201d\u7684\u987a\u5e8f\u5199\u3002`;
        }

        function extractMathSignals(text = '') {
            const raw = String(text || '');
            const signals = [];
            const add = (name, formula, test) => { if (test(raw)) signals.push({ name, formula }); };
            add('\u7b49\u4ef7\u65e0\u7a77\u5c0f', '\\sin x\\sim x,\\quad 1-\\cos x\\sim \\frac{x^2}{2},\\quad \\ln(1+x)\\sim x', t => /(sin|cos|tan|ln|e\^|\\sin|\\cos|\\ln|\u65e0\u7a77\u5c0f|\u7b49\u4ef7)/i.test(t));
            add('\u6d1b\u5fc5\u8fbe\u6cd5\u5219', '\\lim \\frac{f(x)}{g(x)}=\\lim \\frac{f\\prime(x)}{g\\prime(x)}', t => /(0\/0|infty|\\infty|\u221e|\u6d1b\u5fc5\u8fbe|\u672a\u5b9a\u5f0f)/i.test(t));
            add('\u5bfc\u6570\u5b9a\u4e49', "f'(x_0)=\\lim_{\\Delta x\\to0}\\frac{f(x_0+\\Delta x)-f(x_0)}{\\Delta x}", t => /(f'|\\prime|\u5bfc\u6570|\u5207\u7ebf|\u6cd5\u7ebf|\u53ef\u5bfc)/i.test(t));
            add('\u5206\u90e8\u79ef\u5206', '\\int u\\,dv=uv-\\int v\\,du', t => /(\u5206\u90e8|\u79ef\u5206|\\int|\u222b)/.test(t) && /(ln|e\^|sin|cos|\u4e58)/i.test(t));
            add('\u5b9a\u79ef\u5206\u5bf9\u79f0\u6027', '\\int_{-a}^{a} f(x)dx=0\\ (f\\text{ odd}),\\quad 2\\int_0^a f(x)dx\\ (f\\text{ even})', t => /(\u5bf9\u79f0|\u5947\u51fd\u6570|\u5076\u51fd\u6570|-a|\\int_\{-)/.test(t));
            add('\u6536\u655b\u534a\u5f84', 'R=\\frac{1}{\\lim |a_{n+1}/a_n|}', t => /(\u5e42\u7ea7\u6570|\u6536\u655b\u534a\u5f84|\u6536\u655b\u57df|\\sum)/.test(t));
            add('\u7279\u5f81\u503c', '|A-\\lambda I|=0', t => /(\u7279\u5f81\u503c|\u7279\u5f81\u5411\u91cf|\u76f8\u4f3c|\u5bf9\u89d2\u5316|lambda|\\lambda)/i.test(t));
            add('\u77e9\u9635\u79e9', 'r(A)=\\text{\u9636\u68af\u5f62\u4e2d\u975e\u96f6\u884c\u6570}', t => /(\u79e9|rank|\u7ebf\u6027\u65e0\u5173|\u6781\u5927\u65e0\u5173)/i.test(t));
            add('\u7ebf\u6027\u65b9\u7a0b\u7ec4', 'Ax=b,\\quad x=x_0+k_1\\xi_1+\\cdots+k_s\\xi_s', t => /(Ax=|\u65b9\u7a0b\u7ec4|\u57fa\u7840\u89e3\u7cfb|\u901a\u89e3)/i.test(t));
            add('\u6761\u4ef6\u6982\u7387', 'P(A|B)=\\frac{P(AB)}{P(B)}', t => /(\u6761\u4ef6\u6982\u7387|P\(|\u72ec\u7acb|\u4e92\u65a5|\u5168\u6982\u7387|\u8d1d\u53f6\u65af)/.test(t));
            add('\u671f\u671b\u65b9\u5dee', 'D(X)=E(X^2)-[E(X)]^2', t => /(\u671f\u671b|\u65b9\u5dee|E\(|D\(|\u534f\u65b9\u5dee)/.test(t));
            add('\u6b63\u6001\u6807\u51c6\u5316', 'Z=\\frac{X-\\mu}{\\sigma}', t => /(\u6b63\u6001|N\(|\u6807\u51c6\u5316|\u4e2d\u5fc3\u6781\u9650)/.test(t));
            return signals.slice(0, 4);
        }

        function coachPromptPayload(info, level) {
            const signals = extractMathSignals(info.text);
            return {
                signals,
                prompt: [
                    '\u8bf7\u4f5c\u4e3a\u6570\u5b66\u5b66\u4e60\u6559\u7ec3\uff0c\u7ed3\u5408\u9898\u5e72\u6587\u5b57\u3001\u7ec6\u5206\u9898\u578b\u3001\u5173\u952e\u8bcd\u548c\u516c\u5f0f\u751f\u6210\u63d0\u793a\u3002',
                    '\u53ea\u8f93\u51fa JSON {"hint":"..."}\uff1b\u4e0d\u76f4\u63a5\u7ed9\u6700\u7ec8\u7b54\u6848\uff1b\u5c3d\u91cf\u5305\u542b\u4e00\u4e2a\u4e0e\u9898\u5e72\u76f8\u5173\u7684 LaTeX \u516c\u5f0f\u3002',
                    `\u7ea7\u522b ${level}/4\uff0c\u5b66\u79d1 ${info.subjectName}\uff0c\u7ec6\u5206\u9898\u578b ${info.topic}\uff0c\u5173\u952e\u8bcd ${info.keywords.join('\u3001') || '\u65e0'}\u3002`,
                    `\u9898\u5e72\uff1a${info.q.question}`,
                    (info.q.options || []).length ? `\u9009\u9879\uff1a${info.q.options.join('\u3001')}` : '',
                    signals.length ? `\u5019\u9009\u516c\u5f0f\uff1a${signals.map(s => `${s.name}: ${s.formula}`).join('\u3001')}` : ''
                ].filter(Boolean).join('\n')
            };
        }

        async function requestCoachHint(question, level) {
            const info = coachQuestionInfo(question);
            const cacheKey = `${questionKey(info.q)}:${level}:${info.topic}:${info.keywords.join(',')}`;
            if (coachHintCache.has(cacheKey)) return coachHintCache.get(cacheKey);
            const local = localCoachHint(info.q, level);
            const payload = coachPromptPayload(info, level);
            const localModel = await callConfiguredLocalJson(payload.prompt);
            if (localModel?.hint) {
                const hint = String(localModel.hint);
                coachHintCache.set(cacheKey, hint);
                return hint;
            }
            const shouldTryRemote = !!(settings.aiApiKey || settings.aiBaseUrl || settings.aiModel);
            if (!shouldTryRemote) {
                coachHintCache.set(cacheKey, local);
                return local;
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5500);
            try {
                const res = await fetch(apiUrl('/api/ai-guide'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        level,
                        question: info.q.question,
                        options: info.q.options || [],
                        answerType: info.q.type || 'fill',
                        subject: info.subject,
                        subjectName: info.subjectName,
                        topic: info.topic,
                        keywords: info.keywords,
                        signals: payload.signals,
                        ai: { provider: settings.aiProvider, baseUrl: settings.aiBaseUrl, apiKey: settings.aiApiKey, model: settings.aiModel }
                    })
                });
                const data = await res.json();
                const hint = data.ok && data.hint ? String(data.hint) : local;
                coachHintCache.set(cacheKey, hint);
                return hint;
            } catch (_) {
                coachHintCache.set(cacheKey, local);
                return local;
            } finally {
                clearTimeout(timeoutId);
            }
        }

        function startCoachTimer() {
            coachState.startTime = Date.now();
            clearInterval(coachState.timerId);
            const update = () => {
                const elapsed = Math.floor((Date.now() - coachState.startTime) / 1000);
                const m = Math.floor(elapsed / 60);
                const s = elapsed % 60;
                const el = $('coachTimer');
                if (el) el.textContent = `\u601d\u8003\u65f6\u95f4 ${m}:${String(s).padStart(2, '0')}`;
            };
            update();
            coachState.timerId = setInterval(update, 1000);
        }

        function renderCoachUI() {
            const meta = $('coachMeta');
            if (meta) meta.textContent = `\u63d0\u793a\u7ea7\u522b ${coachState.hintLevel} / 4`;
            const content = $('coachContent');
            const trigger = $('coachTriggerBtn');
            const retryRow = $('coachRetryRow');
            if (!content || !trigger || !retryRow) return;
            if (coachState.hintLevel === 0) {
                content.innerHTML = '<div class="coach-empty">\u70b9\u51fb\u4e0b\u65b9\u6309\u94ae\u83b7\u53d6\u63d0\u793a\u3002<br>\u5f15\u5bfc\u4f1a\u7ed3\u5408\u9898\u5e72\u3001\u7ec6\u5206\u9898\u578b\u548c\u5173\u952e\u8bcd\u3002</div>';
                trigger.style.display = '';
                trigger.textContent = '\u9700\u8981\u4e00\u70b9\u601d\u8def';
                trigger.disabled = false;
                retryRow.style.display = 'none';
            } else if (coachState.hintLevel >= 4) {
                trigger.style.display = 'none';
                retryRow.style.display = 'none';
            } else {
                trigger.style.display = coachState.waitingRetry ? 'none' : '';
                trigger.textContent = `\u83b7\u53d6\u7b2c ${coachState.hintLevel + 1} \u7ea7\u63d0\u793a`;
                trigger.disabled = false;
                retryRow.style.display = coachState.waitingRetry ? 'flex' : 'none';
            }
        }

        async function showCoachHint(level) {
            const question = state.sessionQuestions[state.currentQuestionIndex];
            const content = $('coachContent');
            if (!question || !content) return;
            const bubble = document.createElement('div');
            bubble.className = 'coach-hint-bubble';
            const levelName = coachBetterLevelNames[level - 1] || '\u63d0\u793a';
            bubble.innerHTML = `<span class="coach-hint-level-tag">L${level} ${levelName}</span><div>\u6b63\u5728\u751f\u6210\u5f15\u5bfc...</div>`;
            content.innerHTML = '';
            content.appendChild(bubble);
            const hint = await requestCoachHint(question, level);
            bubble.innerHTML = `<span class="coach-hint-level-tag">L${level} ${levelName}</span><div>${htmlWithMath(hint)}</div>`;
        }

        async function onCoachTrigger() {
            if (coachState.hintLevel >= 4) return;
            coachState.hintLevel++;
            coachState.attemptCount++;
            const trigger = $('coachTriggerBtn');
            if (trigger) trigger.disabled = true;
            await showCoachHint(coachState.hintLevel);
            if (coachState.hintLevel < 4) coachState.waitingRetry = true;
            renderCoachUI();
        }

        function toggleCoachPanel() {
            const panel = $('coachPanel');
            const fab = $('coachFab');
            if (!panel || !fab) return;
            coachState.isOpen = !coachState.isOpen;
            panel.classList.toggle('show', coachState.isOpen);
            fab.classList.toggle('active', coachState.isOpen);
            fab.textContent = coachState.isOpen ? 'x' : '?';
            if (coachState.isOpen) {
                // 面板定位在 fab 下方
                const rect = fab.getBoundingClientRect();
                const panelW = Math.min(360, window.innerWidth - 32);
                let left = rect.left;
                let top = rect.bottom + 8;
                // 防止超出右边界
                if (left + panelW > window.innerWidth - 12) left = window.innerWidth - panelW - 12;
                if (left < 12) left = 12;
                // 防止超出下边界（翻转到上方）
                const estPanelH = Math.min(window.innerHeight * 0.7, 500);
                if (top + estPanelH > window.innerHeight - 12) {
                    top = Math.max(12, rect.top - estPanelH - 8);
                }
                panel.style.left = left + 'px';
                panel.style.top = top + 'px';
                panel.style.bottom = 'auto';
                panel.style.right = 'auto';
                if (!coachState.timerId) startCoachTimer();
            }
        }

        function closeCoachPanel() {
            coachState.isOpen = false;
            const panel = $('coachPanel');
            const fab = $('coachFab');
            if (panel) panel.classList.remove('show');
            if (fab) { fab.classList.remove('active'); fab.textContent = '?'; }
        }

        function initCoach() {
            const fab = $('coachFab');
            $('coachTriggerBtn')?.addEventListener('click', onCoachTrigger);
            $('coachRetryBtn')?.addEventListener('click', onCoachRetry);
            $('coachCloseBtn')?.addEventListener('click', closeCoachPanel);

            // 拖动逻辑：pointerdown -> pointermove -> pointerup
            if (fab) {
                let dragging = false;
                let moved = false;
                let startX = 0, startY = 0;
                let origLeft = 0, origTop = 0;

                fab.addEventListener('pointerdown', e => {
                    dragging = true;
                    moved = false;
                    startX = e.clientX;
                    startY = e.clientY;
                    const rect = fab.getBoundingClientRect();
                    origLeft = rect.left;
                    origTop = rect.top;
                    fab.setPointerCapture(e.pointerId);
                    fab.classList.add('dragging');
                    e.preventDefault();
                });

                fab.addEventListener('pointermove', e => {
                    if (!dragging) return;
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
                    if (!moved) return;
                    let newLeft = origLeft + dx;
                    let newTop = origTop + dy;
                    // 边界约束
                    const margin = 8;
                    newLeft = Math.max(margin, Math.min(window.innerWidth - fab.offsetWidth - margin, newLeft));
                    newTop = Math.max(margin, Math.min(window.innerHeight - fab.offsetHeight - margin, newTop));
                    fab.style.left = newLeft + 'px';
                    fab.style.top = newTop + 'px';
                    fab.style.right = 'auto';
                    fab.style.bottom = 'auto';
                    // 同步面板位置
                    if (coachState.isOpen) {
                        const panel = $('coachPanel');
                        if (panel) {
                            const panelW = Math.min(360, window.innerWidth - 32);
                            let pLeft = newLeft;
                            let pTop = newTop + fab.offsetHeight + 8;
                            if (pLeft + panelW > window.innerWidth - 12) pLeft = window.innerWidth - panelW - 12;
                            if (pLeft < 12) pLeft = 12;
                            const estPanelH = Math.min(window.innerHeight * 0.7, 500);
                            if (pTop + estPanelH > window.innerHeight - 12) {
                                pTop = Math.max(12, newTop - estPanelH - 8);
                            }
                            panel.style.left = pLeft + 'px';
                            panel.style.top = pTop + 'px';
                        }
                    }
                });

                fab.addEventListener('pointerup', e => {
                    if (!dragging) return;
                    dragging = false;
                    fab.releasePointerCapture(e.pointerId);
                    fab.classList.remove('dragging');
                    // 没有移动才触发点击（切换面板）
                    if (!moved) toggleCoachPanel();
                });

                fab.addEventListener('pointercancel', () => {
                    dragging = false;
                    fab.classList.remove('dragging');
                });
            }
        }

        /* ============ 评论区 ============ */
        const commentStorageKey = 'focusmath-comments';
        function loadComments() {
            try { return JSON.parse(localStorage.getItem(commentStorageKey) || '[]'); }
            catch { return []; }
        }
        function saveComments(list) {
            try { localStorage.setItem(commentStorageKey, JSON.stringify(list)); } catch {}
        }
        function formatCommentTime(ts) {
            const d = new Date(ts);
            const now = new Date();
            const diff = (now - d) / 1000;
            if (diff < 60) return '刚刚';
            if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
            if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const h = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            return `${m}-${day} ${h}:${min}`;
        }
        function renderComments() {
            const list = loadComments();
            const container = $('commentList');
            const empty = $('commentEmpty');
            if (!container || !empty) return;
            if (list.length === 0) {
                container.innerHTML = '';
                empty.style.display = '';
                return;
            }
            empty.style.display = 'none';
            container.innerHTML = list.slice().reverse().map(c => `
                <div class="comment-item">
                    <div class="comment-item-header">
                        <span class="comment-item-name">${escapeHtml(c.name)}</span>
                        <span class="comment-item-time">${formatCommentTime(c.time)}</span>
                    </div>
                    <div class="comment-item-text">${escapeHtml(c.text)}</div>
                </div>
            `).join('');
        }
        function showCommentHint(msg, isError) {
            const el = $('commentHint');
            if (!el) return;
            el.textContent = msg;
            el.classList.toggle('error', !!isError);
            clearTimeout(el._timer);
            el._timer = setTimeout(() => { el.textContent = ''; }, 3000);
        }
        function submitComment(isPublic) {
            const nameEl = $('commentName');
            const textEl = $('commentText');
            if (!nameEl || !textEl) return;
            const text = textEl.value.trim();
            if (!text) {
                showCommentHint('请输入内容', true);
                return;
            }
            const name = nameEl.value.trim() || '匿名用户';
            if (isPublic) {
                const list = loadComments();
                list.push({ name, text, time: Date.now() });
                saveComments(list);
                renderComments();
                showCommentHint('留言已发布', false);
            } else {
                // 私发反馈：尝试发送到后端，失败则存本地标记
                const feedback = { name, text, time: Date.now(), type: 'feedback' };
                const sent = sendFeedbackToServer(feedback);
                if (sent) {
                    showCommentHint('反馈已发送给官方', false);
                } else {
                    // 本地存储反馈，待下次上线时重试
                    try {
                        const fbList = JSON.parse(localStorage.getItem('focusmath-feedbacks') || '[]');
                        fbList.push(feedback);
                        localStorage.setItem('focusmath-feedbacks', JSON.stringify(fbList));
                    } catch {}
                    showCommentHint('反馈已保存，将在网络恢复后发送', false);
                }
            }
            textEl.value = '';
        }
        function sendFeedbackToServer(feedback) {
            if (isLocalFile) return false;
            try {
                fetch('/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(feedback)
                }).catch(() => {});
                return true;
            } catch { return false; }
        }
        function initComments() {
            $('commentSubmitBtn')?.addEventListener('click', () => submitComment(true));
            $('feedbackSubmitBtn')?.addEventListener('click', () => submitComment(false));
            renderComments();
        }

        /* ============ Tutorial ============ */
        const tutorialSeenKey = 'focusmath-tutorial-seen-v1';
        let tutorialIndex = 0;

        function showTutorial() {
            const modal = $('tutorialModal');
            if (!modal) return;
            buildTutorialSlides();
            tutorialIndex = 0;
            renderTutorialState();
            modal.classList.add('show');
        }

        function closeTutorial() {
            const modal = $('tutorialModal');
            if (modal) modal.classList.remove('show');
            try { localStorage.setItem(tutorialSeenKey, '1'); } catch (e) {}
        }

        function navigateTutorial(direction) {
            const slides = document.querySelectorAll('#tutorialSlides .tutorial-slide');
            if (!slides.length) return;
            tutorialIndex = Math.max(0, Math.min(slides.length - 1, tutorialIndex + direction));
            renderTutorialState();
        }

        function goToTutorialSlide(index) {
            const slides = document.querySelectorAll('#tutorialSlides .tutorial-slide');
            if (!slides.length) return;
            tutorialIndex = Math.max(0, Math.min(slides.length - 1, index));
            renderTutorialState();
        }

        function renderTutorialState() {
            const slides = document.querySelectorAll('#tutorialSlides .tutorial-slide');
            const track = $('tutorialSlides');
            if (!track || !slides.length) return;
            track.style.transform = `translateX(-${tutorialIndex * 100}%)`;
            $('tutorialPrev').disabled = tutorialIndex === 0;
            // 最后一页不应该是 disabled，确保"完成"按钮可点击
            $('tutorialNext').disabled = false;
            $('tutorialNext').textContent = tutorialIndex === slides.length - 1 ? '完成' : '下一页';
            const dots = $('tutorialDots');
            if (dots) {
                dots.innerHTML = Array.from(slides).map((_, i) => `<span class="tutorial-dot${i === tutorialIndex ? ' active' : ''}" data-slide="${i}"></span>`).join('');
            }
        }

        function buildTutorialSlides() {
            const track = $('tutorialSlides');
            if (!track || track.dataset.built) return;
            track.dataset.built = '1';
            const slides = [
                `<div class="tutorial-slide">
                    <div class="tutorial-icon-row"><span class="fm-icon focus" style="width:48px;height:48px;font-size:22px;"></span></div>
                    <h3>欢迎使用 FocusMath</h3>
                    <p>这是一款专注数学学习的工具，集<strong>题库、统计、收藏、思维导图</strong>于一体。</p>
                    <p>本教程将带你快速了解所有核心功能。点击「下一页」浏览，或随时「跳过教程」直接开始。</p>
                    <p class="hint">提示：可以左右滑动 / 点击下方圆点快速跳转。</p>
                </div>`,
                `<div class="tutorial-slide">
                    <h3>选择学科与模式</h3>
                    <div class="tutorial-demo">
                        <div class="tutorial-demo-card">&int;</div>
                        <div class="tutorial-demo-card">#</div>
                        <div class="tutorial-demo-card">P</div>
                        <span class="tutorial-finger" style="left:30px;bottom:-6px;"></span>
                    </div>
                    <p>主页有<strong>高等数学 / 线性代数 / 概率统计</strong>三张学科卡片。</p>
                    <p>点击任意学科卡片即可进入<strong>自适应模式</strong>，系统会按你的水平自动选题；点击下方「自定义模式」卡片则可手动指定题型、难度与题量。</p>
                </div>`,
                `<div class="tutorial-slide">
                    <h3>上方栏的五个功能</h3>
                    <div class="tutorial-demo">
                        <span class="tutorial-demo-icon"><span class="fm-icon stats"></span></span>
                        <span class="tutorial-demo-icon"><span class="fm-icon bank"></span></span>
                        <span class="tutorial-demo-icon"><span class="fm-icon fav"></span></span>
                        <span class="tutorial-demo-icon"><span class="fm-icon settings"></span></span>
                        <span class="tutorial-demo-icon"><span class="fm-icon focus"></span></span>
                        <span class="tutorial-finger" style="left:8px;bottom:-6px;"></span>
                    </div>
                    <p>右上角五个图标依次为：</p>
                    <p><strong>统计</strong>查看答题数据与连击；<strong>题库</strong>浏览全部题目；<strong>收藏夹</strong>回顾收藏题；<strong>设置</strong>调整所有配置；<strong>专注模式</strong>进入沉浸式答题。</p>
                    <p class="hint">鼠标悬停图标会显示名称提示。</p>
                </div>`,
                `<div class="tutorial-slide">
                    <h3>题库功能 · 筛选</h3>
                    <div class="tutorial-demo">
                        <span class="tutorial-demo-btn">学科 ▾</span>
                        <span class="tutorial-demo-btn">题型 ▾</span>
                        <span class="tutorial-demo-btn">难度 ▾</span>
                        <span class="tutorial-finger" style="left:8px;bottom:-6px;"></span>
                    </div>
                    <p>进入题库后，顶部有筛选下拉框，可按<strong>学科、题型、难度、关键词</strong>快速定位题目。</p>
                    <p>支持分页浏览，每页题数可在「设置 → 题目设置」中调整。</p>
                </div>`,
                `<div class="tutorial-slide">
                    <h3>题库功能 · 导入与预览</h3>
                    <div class="tutorial-demo">
                        <span class="tutorial-demo-btn">导入文件</span>
                        <div class="tutorial-demo-card" style="width:90px;font-size:11px;">题目卡片</div>
                        <span class="tutorial-finger" style="right:24px;bottom:-6px;"></span>
                    </div>
                    <p>支持导入 <strong>TXT / JSON</strong> 格式的题库文件，自动跳过重复或相似度高的题目。</p>
                    <p>点击任意题目卡片可<strong>预览详情</strong>，并快速收藏或导出当前题。</p>
                </div>`,
                `<div class="tutorial-slide">
                    <h3>思维导图</h3>
                    <div class="tutorial-demo">
                        <span class="tutorial-demo-icon" style="background:var(--ocean);border-color:var(--ocean);"></span>
                        <span class="tutorial-demo-icon" style="margin-left:18px;"></span>
                        <span class="tutorial-demo-icon" style="margin-left:18px;"></span>
                        <span class="tutorial-demo-icon" style="position:absolute;left:50%;top:50%;"></span>
                    </div>
                    <p>主页下方的思维导图区域可基于你的学习数据<strong>生成知识网络</strong>，悬停节点查看详情。</p>
                    <p>节点透明度、连线显隐均可在「设置 → 显示设置」中调整；支持导出为 <strong>SVG / PNG / JSON</strong>。</p>
                </div>`,
                `<div class="tutorial-slide">
                    <h3>键盘快捷键</h3>
                    <div class="tutorial-demo" style="gap:4px;">
                        <span class="tutorial-key-hint">1-5</span><span class="tutorial-key-hint">0</span>
                        <span class="tutorial-key-hint">↑↓←→</span><span class="tutorial-key-hint">↵</span>
                        <span class="tutorial-key-hint">Esc</span><span class="tutorial-key-hint">C</span>
                        <span class="tutorial-key-hint">F</span><span class="tutorial-key-hint">E</span>
                    </div>
                    <p><strong>1-5</strong>：切换统计/题库/收藏/设置/专注；<strong>0</strong>：返回主页。</p>
                    <p>答题中：<strong>方向键</strong>选择选项，<strong>Enter</strong>确认或下一题，<strong>Esc</strong>返回首页，<strong>C</strong>计算器，<strong>F</strong>收藏，<strong>E</strong>导出。</p>
                    <p class="hint">所有键位可在「设置 → 键盘设置」中自定义；可在「按键设置」中开关 Shift 修饰键以防误触。</p>
                    <p class="hint">\u65b0\u589e\uff1aSpace \u4e5f\u80fd\u70b9\u51fb\u9ad8\u4eae\u9879\uff1bShift+\u65b9\u5411\u952e\u79fb\u52a8\u5c4f\u5e55\u5149\u6807\uff1b\u8349\u7a3f\u7eb8\u7528 P/L/O/E \u5207\u5de5\u5177\uff1b\u9898\u5e93\u7528 / \u641c\u7d22\u3001[ ] \u7ffb\u9875\uff1b\u56fe\u8c31\u7528 +/- \u7f29\u653e\u3002</p>
                </div>`,
                `<div class="tutorial-slide">
                    <div class="tutorial-icon-row"><span class="fm-icon fav" style="width:42px;height:42px;"></span></div>
                    <h3>完成！准备好开始了吗？</h3>
                    <p>恭喜你完成了新手教程 🎉 现在可以点击「完成」开始你的专注数学之旅。</p>
                    <p>想再次查看？随时到「设置 → 数据设置」点击「重新播放教程」即可。</p>
                    <p>键位与显示偏好都可以在<strong>设置</strong>中随时调整。</p>
                </div>`
            ];
            slides.splice(slides.length - 1, 0,
                `<div class="tutorial-slide">
                    <div class="tutorial-demo">
                        <span class="tutorial-demo-icon"><span class="fm-icon ai"></span></span>
                        <span class="tutorial-demo-btn">\u5b66\u4e60\u6559\u7ec3</span>
                        <span class="tutorial-demo-card">\\int</span>
                    </div>
                    <h3>\u7b54\u9898\u65f6\u7684\u5b66\u4e60\u6559\u7ec3</h3>
                    <p>\u9898\u76ee\u65c1\u7684\u5b66\u4e60\u6559\u7ec3\u4f1a\u6839\u636e<strong>\u9898\u5e72\u6587\u5b57\u3001\u7ec6\u5206\u9898\u578b\u548c\u5173\u952e\u516c\u5f0f</strong>\u7ed9\u51fa\u5206\u5c42\u63d0\u793a\uff0c\u5c3d\u91cf\u4e0d\u76f4\u63a5\u7ed9\u7b54\u6848\u3002</p>
                    <p>\u5982\u679c\u5728 AI \u8bbe\u7f6e\u91cc\u63a5\u5165 API \u6216\u5f00\u542f\u672c\u5730\u6a21\u578b\uff0c\u5b83\u4f1a\u7ed3\u5408\u9898\u5e72\u518d\u751f\u6210\u66f4\u5177\u4f53\u7684\u5f15\u5bfc\u3002</p>
                </div>`,
                `<div class="tutorial-slide">
                    <div class="tutorial-demo">
                        <span class="tutorial-demo-btn">M</span>
                        <span class="tutorial-demo-card">\u8349\u7a3f</span>
                        <span class="tutorial-demo-btn">\u222b</span>
                    </div>
                    <h3>\u8ba1\u7b97\u5668\u548c\u8349\u7a3f\u7eb8</h3>
                    <p>\u7b54\u9898\u9875\u53f3\u4fa7\u7684 <strong>M</strong> \u6309\u94ae\u53ef\u6253\u5f00\u8ba1\u7b97\u5668\uff0c\u652f\u6301\u5206\u5f0f\u3001\u6839\u53f7\u3001\u4e09\u89d2\u51fd\u6570\u548c\u89d2\u5ea6/\u5f27\u5ea6\u5207\u6362\u3002</p>
                    <p>\u4e0b\u65b9\u8349\u7a3f\u7eb8\u53ef\u4ee5\u753b\u7ebf\u3001\u753b\u5706\u548c\u64e6\u9664\u3002\u5728\u300c\u9898\u76ee\u8bbe\u7f6e\u300d\u4e2d\u53ef\u9009\u62e9\u8ba1\u7b97\u5668\u662f\u5b8c\u5168\u5c55\u5f00\u8fd8\u662f\u5185\u90e8\u6eda\u52a8\u3002</p>
                </div>`,
                `<div class="tutorial-slide">
                    <div class="tutorial-demo">
                        <span class="tutorial-demo-icon"><span class="fm-icon bank"></span></span>
                        <span class="tutorial-demo-btn">AI \u5206\u7c7b</span>
                        <span class="tutorial-demo-btn">\u81ea\u52a8\u5bfc\u5165</span>
                    </div>
                    <h3>\u9898\u5e93\u3001AI \u5206\u7c7b\u548c\u81ea\u52a8\u5bfc\u5165</h3>
                    <p>\u9898\u5e93\u53ef\u6309\u5b66\u79d1\u3001\u4e3b\u8981\u9898\u578b\u3001\u7ec6\u5206\u9898\u578b\u3001\u96be\u5ea6\u3001\u7ec3\u4e60\u72b6\u6001\u7b5b\u9009\u3002</p>
                    <p>\u5f00\u542f AI \u6216\u672c\u5730\u6a21\u578b\u540e\uff0c\u53ef\u5bf9\u9898\u5e93\u81ea\u52a8\u5206\u7c7b\uff0c\u4e5f\u53ef\u7528\u5173\u952e\u8bcd\u751f\u6210/\u641c\u7d22\u5019\u9009\u9898\u5e76\u6279\u91cf\u5bfc\u5165\u3002</p>
                </div>`,
                `<div class="tutorial-slide">
                    <div class="tutorial-demo">
                        <span class="tutorial-demo-icon"><span class="fm-icon stats"></span></span>
                        <span class="tutorial-demo-btn">\u7efc\u5408\u5206\u6790</span>
                        <span class="tutorial-demo-btn">\u77e5\u8bc6\u7f51\u7edc</span>
                    </div>
                    <h3>\u7edf\u8ba1\u9875\u4e0d\u53ea\u770b\u6b63\u786e\u7387</h3>
                    <p>\u7edf\u8ba1\u9875\u53ef\u770b\u5386\u53f2\u8bb0\u5f55\u3001\u8d8b\u52bf\u56fe\u3001\u9898\u5e93\u8986\u76d6\u3001\u6210\u5c31\u548c<strong>\u7efc\u5408\u5206\u6790</strong>\u3002</p>
                    <p>\u7efc\u5408\u5206\u6790\u4f1a\u6839\u636e\u6d4f\u89c8\u5668\u4fdd\u5b58\u7684\u5b66\u4e60\u6570\u636e\uff0c\u63d0\u9192\u8584\u5f31\u9898\u578b\u548c\u5f88\u4e45\u6ca1\u7ec3\u7684\u77e5\u8bc6\u70b9\uff0c\u5e76\u63a8\u8350\u53ef\u70b9\u51fb\u8fdb\u5165\u7684\u76f8\u4f3c\u9898\u3002</p>
                </div>`,
                `<div class="tutorial-slide">
                    <div class="tutorial-demo" style="gap:4px;">
                        <span class="tutorial-key-hint">Shift</span>
                        <span class="tutorial-key-hint">\u2191</span>
                        <span class="tutorial-key-hint">\u2193</span>
                        <span class="tutorial-key-hint">\u2190</span>
                        <span class="tutorial-key-hint">\u2192</span>
                    </div>
                    <h3>\u65b9\u5411\u952e\u548c Shift \u65b9\u5411\u952e</h3>
                    <p>\u4e0d\u6309 Shift \u65f6\uff0c\u65b9\u5411\u952e\u4f9d\u7136\u7528\u6765\u79fb\u52a8\u9875\u9762\u6216\u9898\u76ee\u9009\u9879\u7684\u9ad8\u4eae\u3002</p>
                    <p>\u6309\u4f4f <strong>Shift + \u65b9\u5411\u952e</strong> \u65f6\uff0c\u4f1a\u79fb\u52a8\u5c4f\u5e55\u4e0a\u7684\u51c6\u661f\u5149\u6807\uff0c\u4e0d\u4f1a\u6539\u53d8\u5df2\u9009\u4e2d\u7684\u6309\u94ae\u3002</p>
                </div>`
            );
            track.innerHTML = slides.join('');
        }

        function bindKeyboardAndTutorial() {
            document.addEventListener('keydown', handleGlobalKeydown);
            const kbToggle = $('keyboardEnabledToggle');
            if (kbToggle) {
                kbToggle.addEventListener('click', () => {
                    settings.keyboard.enabled = !settings.keyboard.enabled;
                    applySettings();
                    saveData();
                });
            }
            const kbContainer = $('keyboardBindings');
            if (kbContainer) {
                kbContainer.addEventListener('click', e => {
                    const cap = e.target.closest('.key-cap');
                    if (cap) { startKeyBinding(cap.dataset.action); return; }
                    const dis = e.target.closest('.key-disable-toggle');
                    if (dis) {
                        const act = dis.dataset.action;
                        const idx = settings.keyboard.disabled.indexOf(act);
                        if (idx >= 0) settings.keyboard.disabled.splice(idx, 1);
                        else settings.keyboard.disabled.push(act);
                        saveData();
                        renderKeyboardBindings();
                    }
                });
            }
            // Tutorial bindings
            $('tutorialPrev')?.addEventListener('click', () => navigateTutorial(-1));
            $('tutorialNext')?.addEventListener('click', () => {
                const slides = document.querySelectorAll('#tutorialSlides .tutorial-slide');
                if (tutorialIndex >= slides.length - 1) closeTutorial();
                else navigateTutorial(1);
            });
            $('tutorialSkip')?.addEventListener('click', closeTutorial);
            $('tutorialDots')?.addEventListener('click', e => {
                const dot = e.target.closest('.tutorial-dot');
                if (dot) goToTutorialSlide(Number(dot.dataset.slide));
            });
            $('tutorialModal')?.querySelector('.modal-backdrop')?.addEventListener('click', closeTutorial);
        }

        function bindEvents() {
            $('statsHeaderBtn').addEventListener('click', () => showScreen('statsScreen'));
            $('bankHeaderBtn').addEventListener('click', () => showScreen('bankScreen'));
            $('favHeaderBtn').addEventListener('click', () => showScreen('favoritesScreen'));
            $('dataGatewayToggle').addEventListener('click', () => {
                $('dataGateway').classList.toggle('open');
            });
            $('exportLocalDataBtn').addEventListener('click', exportLocalData);
            $('importLocalDataBtn').addEventListener('click', () => $('localDataFileInput').click());
            $('localDataFileInput').addEventListener('change', e => importLocalDataFile(e.target.files?.[0]));
            $('sendMagicLinkBtn').addEventListener('click', sendMagicLink);
            $('uploadCloudSaveBtn').addEventListener('click', uploadCloudSave);
            $('settingsBtn').addEventListener('click', () => {
                $('settingsModal').classList.add('show');
                settingsPage = 0;
                requestAnimationFrame(layoutSettingsPages);
            });
            $('closeSettings').addEventListener('click', () => $('settingsModal').classList.remove('show'));
            $('focusToggle').addEventListener('click', () => setFocusMode(!state.focusMode));
            $('setupFocusToggle').addEventListener('click', () => setFocusMode(!state.focusMode));
            $('exitFocus').addEventListener('click', () => setFocusMode(false));
            $('setupBack').addEventListener('click', () => showScreen('homeScreen'));
            $('statsBack').addEventListener('click', () => showScreen('homeScreen'));
            $('favBack').addEventListener('click', () => showScreen('homeScreen'));
            $('bankBack').addEventListener('click', () => showScreen('homeScreen'));
            if ($('radarBack')) $('radarBack').addEventListener('click', () => showScreen('homeScreen'));
            $('quizBack').addEventListener('click', returnHomeFromQuiz);
            $('homeBtn').addEventListener('click', () => showScreen('homeScreen'));
            $('restartBtn').addEventListener('click', () => openSetup(state.mode, state.subject));
            $('customModeCard').addEventListener('click', () => openSetup('custom', state.subject));
            $('statsModeCard').addEventListener('click', () => showScreen('statsScreen'));
            $('favModeCard').addEventListener('click', () => showScreen('favoritesScreen'));
            if ($('radarModeCard')) $('radarModeCard').addEventListener('click', () => showScreen('radarScreen'));
            bindRadarForm();
            bindRadarTabClicks();
            loadRadarStore();
            $('radarHeaderBtn').addEventListener('click', () => showScreen('radarScreen'));
            $('heroStartBtn')?.addEventListener('click', () => openSetup('adaptive', state.subject));
            $('heroMindmapBtn')?.addEventListener('click', () => {
                const mindmapSection = document.querySelector('.mindmap-wrap');
                if (mindmapSection) mindmapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            $('refreshStatsBtn').addEventListener('click', renderStatsScreen);
            $('exportStatsPdfBtn').addEventListener('click', exportStatsPdf);
            $('generateMindmapBtn').addEventListener('click', renderMindmap);
            $('exportMindmapBtn').addEventListener('click', exportMindmap);
            $('exportNetworkBtn')?.addEventListener('click', exportKnowledgeNetwork);
            $$('.subject-card').forEach(card => card.addEventListener('click', () => openSetup('adaptive', card.dataset.subject)));
            $$('#setupScreen .mode-tab').forEach(btn => btn.addEventListener('click', () => openSetup(btn.dataset.mode, state.subject)));
            $$('#subjectOptions .option-btn').forEach(btn => btn.addEventListener('click', () => {
                if (state.mode === 'custom') {
                    btn.classList.toggle('selected');
                    let selected = getSelectedValues('subjectOptions');
                    if (!selected.length) {
                        btn.classList.add('selected');
                        selected = [btn.dataset.value];
                    }
                    state.customSubjects = selected;
                    state.subject = selected[0];
                } else {
                    state.subject = btn.dataset.value;
                    selectButton('subjectOptions', btn.dataset.value);
                }
            }));
            $$('#typeOptions .option-btn').forEach(btn => btn.addEventListener('click', () => selectButton('typeOptions', btn.dataset.value)));
            $('difficultyRange').addEventListener('input', e => $('difficultyValue').textContent = `L${e.target.value}`);
            $('startQuiz').addEventListener('click', () => startQuiz());
            $('quizScreen').addEventListener('pointerdown', e => {
                if (e.target.closest('#calcPanel, #whiteboard')) return;
                bringFloatingLayerToFront('answer');
            });
            $('nextBtn').addEventListener('click', nextQuestion);
            $('favToggle').addEventListener('click', () => toggleFavorite());
            $('exportQuestionBtn').addEventListener('click', exportCurrentQuestion);
            $$('.bank-tab').forEach(btn => btn.addEventListener('click', () => {
                state.bankSubject = btn.dataset.bankSubject;
                state.bankTopicFilters = [];
                state.bankPage = 1;
                bankRemoteError = '';
                bankPageCache.clear();
                state.bankDeleteSelected = [];
                renderBank();
            }));
            $('bankSearchInput').addEventListener('input', e => {
                state.bankSearch = e.target.value;
                state.bankPage = 1;
                bankRemoteError = '';
                bankPageCache.clear();
                clearTimeout(bankSearchTimer);
                bankSearchTimer = setTimeout(() => renderBank(), 160);
            });
            $('webSearchBtn').addEventListener('click', () => {
                const typed = $('bankSearchInput').value.trim();
                state.bankSearch = typed;
                $('bankSearchStatus').className = 'bank-search-status';
                $('bankSearchStatus').textContent = `联网搜索：${getSubjectName(state.bankSubject)} + ${typed || '典型题'}。可在搜索结果页复制正文后用“导入题目”提取。`;
                const q = encodeURIComponent(`${getSubjectName(state.bankSubject)} 考研数学 ${typed || '典型题'}`);
                window.open(`https://www.bing.com/search?q=${q}`, '_blank');
            });
            $('autoTagBtn').addEventListener('click', autoTagQuestionBank);
            $('autoImportBtn').addEventListener('click', () => {
                autoImportCandidates = [];
                autoImportSelected.clear();
                $('autoImportKeyword').value = state.bankSearch || '';
                $('autoImportStatus').textContent = '按当前科目 + 关键词搜索，候选题会先在这里预览。';
                renderAutoImportCandidates();
                renderAutoImportPreview(null);
                $('autoImportModal').classList.add('show');
            });
            $('deleteImportedBtn').addEventListener('click', () => setBankDeleteMode(true));
            $('cancelDeleteImported').addEventListener('click', () => setBankDeleteMode(false));
            $('confirmDeleteImported').addEventListener('click', deleteSelectedImportedQuestions);
            $('closeAutoImport').addEventListener('click', () => $('autoImportModal').classList.remove('show'));
            $('closeQuestionPreview').addEventListener('click', () => $('questionPreviewModal').classList.remove('show'));
            $('autoImportSearch').addEventListener('click', searchAutoImportQuestions);
            $('selectAllAutoImport').addEventListener('click', () => {
                autoImportCandidates.forEach(q => autoImportSelected.add(q.id));
                renderAutoImportCandidates();
            });
            $('confirmAutoImport').addEventListener('click', confirmAutoImportQuestions);
            $('addQuestionBtn').addEventListener('click', () => $('addQuestionModal').classList.add('show'));
            $('importQuestionBtn').addEventListener('click', () => {
                $('importError').style.display = 'none';
                $('importQuestionModal').classList.add('show');
            });
            $('cancelImportQuestion').addEventListener('click', () => $('importQuestionModal').classList.remove('show'));
            $('fetchWebContent').addEventListener('click', fetchWebText);
            $('confirmImportQuestion').addEventListener('click', confirmImportQuestions);
            $('cancelAddQuestion').addEventListener('click', () => $('addQuestionModal').classList.remove('show'));
            $('confirmAddQuestion').addEventListener('click', addCustomQuestion);
            $$('#bankAddSubject .option-btn').forEach(btn => btn.addEventListener('click', () => selectButton('bankAddSubject', btn.dataset.value)));
            $$('#bankAddType .option-btn').forEach(btn => btn.addEventListener('click', () => {
                selectButton('bankAddType', btn.dataset.value);
                $('bankAddOptionsGroup').style.display = btn.dataset.value === 'choice' ? 'block' : 'none';
            }));
            $('bankAddDifficulty').addEventListener('input', e => $('bankAddDifficultyValue').textContent = `L${e.target.value}`);
            $('fontChineseSelect').addEventListener('change', e => { settings.fontChinese = e.target.value; applySettings(); saveData(); });
            $('fontLatinSelect').addEventListener('change', e => { settings.fontLatin = e.target.value; applySettings(); saveData(); });
            $('bgColorPicker').addEventListener('input', e => { settings.bgColor = e.target.value; applySettings(); saveData(); });
            $$('#bgColorPresets .color-preset').forEach(btn => btn.addEventListener('click', () => { settings.bgColor = btn.dataset.color; applySettings(); saveData(); }));
            $('themeToggle').addEventListener('click', () => { settings.darkMode = !settings.darkMode; applySettings(); saveData(); });
            $('fontSizeRange').addEventListener('input', e => { settings.fontSize = Number(e.target.value); applySettings(); saveData(); });
            $('soundVolumeRange').addEventListener('input', e => { settings.soundVolume = Number(e.target.value); applySettings(); saveData(); });
            $('soundToggle').addEventListener('click', () => {
                settings.sound.enabled = !settings.sound.enabled;
                if (settings.sound.enabled && !(window.AudioContext || window.webkitAudioContext)) {
                    alert('当前浏览器不支持 Web Audio API，无法播放专注声音。');
                    settings.sound.enabled = false;
                }
                animateSettingsContentChange(applySoundSettings);
                if (settings.sound.enabled) startSound();
                else stopSound();
                saveData();
            });
            $$('.sound-tab').forEach(btn => btn.addEventListener('click', () => {
                settings.sound.mode = btn.dataset.sound;
                animateSettingsContentChange(applySoundSettings);
                if (settings.sound.enabled) startSound({ force: true });
                saveData();
            }));
            $('focusSoundVolumeRange').addEventListener('input', e => {
                settings.sound.volume = Number(e.target.value) / 100;
                animateSettingsContentChange(applySoundSettings);
                if (state.isPlaying) AudioEngine.setVolume(settings.sound.volume, 0.1);
                saveData();
            });
            $('brownFilterRange').addEventListener('input', e => {
                settings.sound.brownFilter = Number(e.target.value);
                animateSettingsContentChange(applySoundSettings);
                if (settings.sound.enabled && settings.sound.mode === 'brown') startSound({ force: true });
                saveData();
            });
            $$('#binauralParams .option-btn').forEach(btn => btn.addEventListener('click', () => {
                settings.sound.binauralFreq = Number(btn.dataset.freq);
                animateSettingsContentChange(applySoundSettings);
                if (settings.sound.enabled && settings.sound.mode === 'binaural') startSound({ force: true });
                saveData();
            }));
            $('adaptiveVolumeToggle').addEventListener('click', () => {
                settings.sound.adaptiveVolume = !settings.sound.adaptiveVolume;
                animateSettingsContentChange(applySoundSettings);
                saveData();
            });

            if ($('quizSoundBtn')) {
                let microPanelTimer = null;
                function showMicroPanel() {
                    const panel = $('soundMicroPanel');
                    if (!panel) return;
                    panel.style.display = 'flex';
                    clearTimeout(microPanelTimer);
                    microPanelTimer = setTimeout(() => { panel.style.display = 'none'; }, 3000);
                }

                $('quizSoundBtn').addEventListener('click', () => {
                    const panel = $('soundMicroPanel');
                    if (!panel) return;
                    if (panel.style.display === 'flex') {
                        panel.style.display = 'none';
                        clearTimeout(microPanelTimer);
                    } else {
                        showMicroPanel();
                    }
                });

                $$('.sound-micro-mode').forEach(btn => btn.addEventListener('click', () => {
                    settings.sound.mode = btn.dataset.sound;
                    if (settings.sound.enabled) startSound({ force: true });
                    else { settings.sound.enabled = true; startSound({ force: true }); }
                    updateQuizSoundUI();
                    applySoundSettings();
                    saveData();
                    showMicroPanel();
                }));

                $('quizSoundVolume')?.addEventListener('input', e => {
                    settings.sound.volume = Number(e.target.value) / 100;
                    if (state.isPlaying) AudioEngine.setVolume(settings.sound.volume, 0.1);
                    applySoundSettings();
                    saveData();
                    showMicroPanel();
                });

                $('quizSoundToggle')?.addEventListener('click', () => {
                    settings.sound.enabled = !settings.sound.enabled;
                    if (settings.sound.enabled) startSound();
                    else stopSound();
                    updateQuizSoundUI();
                    applySoundSettings();
                    saveData();
                    showMicroPanel();
                });

                const soundMicroPanel = $('soundMicroPanel');
                if (soundMicroPanel) {
                    soundMicroPanel.addEventListener('mouseenter', showMicroPanel);
                    soundMicroPanel.addEventListener('mousemove', showMicroPanel);
                }
            }

            $('contrastRange').addEventListener('input', e => { settings.contrast = Number(e.target.value); applySettings(); saveData(); });
            $('hideStreakToggle').addEventListener('click', () => { settings.hideStreaks = !settings.hideStreaks; applySettings(); updateHomeStats(); if ($('statsScreen').classList.contains('active')) renderStatsScreen(); saveData(); });
            $('graphNodeOpacityRange').addEventListener('input', e => { settings.graphNodeOpacity = Number(e.target.value); applySettings(); saveData(); if ($('statsScreen').classList.contains('active')) renderKnowledgeNetwork(); });
            $('graphLinksToggle').addEventListener('click', () => { settings.graphLinksVisible = !settings.graphLinksVisible; applySettings(); saveData(); if ($('statsScreen').classList.contains('active')) renderKnowledgeNetwork(); });
            $('mindmapNodeOpacityRange').addEventListener('input', e => { settings.mindmapNodeOpacity = Number(e.target.value); applySettings(); saveData(); renderMindmap(); });
            $('favoritePreviewAnswerToggle').addEventListener('click', () => { settings.favoritePreviewAnswer = !settings.favoritePreviewAnswer; applySettings(); saveData(); if (currentFavQuestion) renderPreview($('favPreview'), currentFavQuestion, 'favorite'); });
            $('bankPageSizeRange').addEventListener('input', e => {
                settings.bankPageSize = Number(e.target.value);
                applySettings();
                bankRemoteMeta.pageSize = settings.bankPageSize;
                bankRemotePageCache.clear();
                bankPageCache.clear();
                state.bankPage = 1;
                if ($('bankScreen').classList.contains('active')) renderBank();
                saveData();
            });
            $('statsHistoryLimitRange').addEventListener('input', e => {
                settings.statsHistoryLimit = Number(e.target.value);
                applySettings();
                if ($('statsScreen').classList.contains('active')) renderStatsScreen();
                saveData();
            });
            $('statsTrendDaysRange').addEventListener('input', e => {
                settings.statsTrendDays = Number(e.target.value);
                applySettings();
                if ($('statsScreen').classList.contains('active')) renderStatsScreen();
                saveData();
            });
            $('newQuestionRatioRange').addEventListener('input', e => {
                settings.newQuestionRatio = Number(e.target.value);
                applySettings();
                saveData();
            });
            $('exportFormatSelect').addEventListener('change', e => { settings.exportFormat = e.target.value; applySettings(); saveData(); });
            $('graphExportFormatSelect').addEventListener('change', e => { settings.graphExportFormat = e.target.value; applySettings(); saveData(); });
            $('aiProviderSelect')?.addEventListener('change', e => { settings.aiProvider = e.target.value; saveData(); syncAiConfigToServer(); });
            $('aiProviderList')?.addEventListener('click', e => {
                const btn = e.target.closest('.ai-provider-btn');
                if (!btn) return;
                const providerId = btn.dataset.provider;
                settings.aiProvider = providerId;
                const provider = aiProviders.find(p => p.id === providerId);
                if (provider && provider.baseUrl) {
                    settings.aiBaseUrl = provider.baseUrl;
                    $('aiBaseUrlInput').value = provider.baseUrl;
                }
                animateSettingsContentChange(() => applySettings());
                saveData();
                syncAiConfigToServer();
            });
            $('aiModelSelect')?.addEventListener('change', e => {
                if (e.target.value) {
                    settings.aiModel = e.target.value;
                    $('aiModelInput').value = e.target.value;
                    saveData();
                    syncAiConfigToServer();
                }
            });
            $('aiBaseUrlInput').addEventListener('change', e => { settings.aiBaseUrl = e.target.value.trim(); saveData(); syncAiConfigToServer(); });
            $('aiApiKeyInput').addEventListener('change', e => { settings.aiApiKey = e.target.value.trim(); saveData(); syncAiConfigToServer(); });
            $('aiModelInput').addEventListener('change', e => { settings.aiModel = e.target.value.trim(); saveData(); syncAiConfigToServer(); });
            // 本地 / 离线模型事件
            $('useLocalModelToggle')?.addEventListener('click', () => {
                settings.useLocalModel = !settings.useLocalModel;
                animateSettingsContentChange(() => applySettings());
                saveData();
                syncAiConfigToServer();
            });
            $$('.local-model-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    settings.localModelType = tab.dataset.localType;
                    animateSettingsContentChange(() => applySettings());
                    saveData();
                });
            });
            $('browserModelSelect')?.addEventListener('change', e => {
                settings.browserModel = e.target.value;
                saveData();
                syncAiConfigToServer();
            });
            $('ollamaBaseUrlInput')?.addEventListener('change', e => {
                settings.ollamaBaseUrl = e.target.value.trim();
                saveData();
                syncAiConfigToServer();
            });
            $('ollamaModelInput')?.addEventListener('change', e => {
                settings.ollamaModel = e.target.value.trim();
                saveData();
                syncAiConfigToServer();
            });
            $('clearImportedQuestionsBtn').addEventListener('click', clearAllImportedQuestions);
            $('clearConfirmToggle').addEventListener('click', () => { settings.clearConfirm = !settings.clearConfirm; applySettings(); saveData(); });
            $('quizShiftRequiredToggle')?.addEventListener('click', () => {
                settings.keyboard.quizShiftRequired = !settings.keyboard.quizShiftRequired;
                applySettings();
                saveData();
            });
            $('headerLabelsToggle')?.addEventListener('click', () => {
                settings.headerLabelsVisible = !settings.headerLabelsVisible;
                applySettings();
                saveData();
            });
            $('hideBgShapesToggle')?.addEventListener('click', () => {
                settings.hideBackgroundShapes = !settings.hideBackgroundShapes;
                applySettings();
                saveData();
                if (settings.hideBackgroundShapes) {
                    if (bgAnimationId) { cancelAnimationFrame(bgAnimationId); bgAnimationId = null; }
                } else {
                    initBackground();
                }
            });
            $('exportAnkiBtn')?.addEventListener('click', exportFavoritesToAnki);
            $('vibrationToggle').addEventListener('click', () => { settings.vibrationEnabled = !settings.vibrationEnabled; applySettings(); saveData(); });
            $$('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', () => backdrop.closest('.modal').classList.remove('show')));
            window.addEventListener('resize', () => {
                if ($('settingsModal').classList.contains('show')) layoutSettingsPages();
            });
            bindKeyboardAndTutorial();
            document.addEventListener('click', e => { if (e.target.closest('button')) playSound('click'); });
        }

        function initAudioContext() {
            if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        }
        document.addEventListener('pointerdown', initAudioContext, { once: true });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (state.isPlaying) {
                    stopSound();
                    state.wasPlayingBeforeHidden = true;
                }
            } else {
                if (settings.sound.enabled && state.wasPlayingBeforeHidden) {
                    startSound();
                }
                state.wasPlayingBeforeHidden = false;
            }
        });

        function rotateHeroCopy() {
            const track = $('heroTaglineTrack');
            if (!track) return;
            const total = track.children.length;
            let index = 0;
            setInterval(() => {
                index = (index + 1) % total;
                track.style.transform = `translateX(-${index * 100}%)`;
            }, 3600);
        }

        document.addEventListener('DOMContentLoaded', async () => {
            // Apply settings early (synchronous) so the first paint uses the
            // saved theme/fonts while the database is being opened.
            try { Object.assign(settings, JSON.parse(localStorage.getItem(settingsKey) || '{}')); } catch (e) {}
            settings.sound = { ...defaultSettings.sound, ...(settings.sound || {}) };
            settings.keyboard = {
                enabled: (settings.keyboard || {}).enabled !== false,
                quizShiftRequired: (settings.keyboard || {}).quizShiftRequired !== false,
                cursorStep: Math.max(8, Math.min(80, Number((settings.keyboard || {}).cursorStep) || defaultSettings.keyboard.cursorStep || 24)),
                bindings: { ...defaultSettings.keyboard.bindings, ...((settings.keyboard || {}).bindings || {}) },
                disabled: Array.isArray((settings.keyboard || {}).disabled) ? (settings.keyboard || {}).disabled.slice() : []
            };
            settings.headerLabelsVisible = settings.headerLabelsVisible === true;
            settings.hideBackgroundShapes = settings.hideBackgroundShapes === true;
            settings.useLocalModel = settings.useLocalModel === true;
            settings.localModelType = settings.localModelType || 'browser';
            settings.browserModel = settings.browserModel || '';
            settings.ollamaBaseUrl = settings.ollamaBaseUrl || 'http://localhost:11434';
            settings.ollamaModel = settings.ollamaModel || '';
            document.body.dataset.quizMode = state.mode || 'adaptive';
            applySettings();
            bindLengthControls();
            bindEvents();
            initModalKeyboardSupport();
            await loadAiConfigFromServer();
            initWhiteboard();
            initCalculator();
            initBackground();
            initCoach();
            initComments();
            rotateHeroCopy();
            trackEvent('visit', { path: location.pathname || 'focusmath.html' });
            // Load lightweight question metadata on first paint; the bank page loads paged questions later.
            // Hydrate the question bank and user state from IndexedDB before
            // rendering anything that depends on them.
            await initDatabase();
            await handleMagicLogin();
            applySettings();
            updateHomeStats();
            if (state.auth?.isLoggedIn) listCloudSaves();
            renderLatex(document.body);
            try {
                if (!localStorage.getItem(tutorialSeenKey)) showTutorial();
            } catch (e) {}
        });

        // ===== Resource Radar Adapters (mock) =====
        const RADAR_PLATFORM_NAMES = { bilibili: 'B 站', zhihu: '知乎', mitocw: 'MIT OCW', khan: 'Khan Academy', blog: '博客', notes: '公开笔记平台' };
        const RADAR_TYPE_NAMES = { video: '视频', article: '文章', lecture: '课程讲义', notes: '学习笔记', solution: '题解', interactive: '交互演示', question: '题目' };
        // 检查网站语言：英语平台用英语关键词查找
        const ENGLISH_PLATFORMS = new Set(['mitocw', 'khan']);
        // 中文数学术语 → 英文（用于英语平台检索）
        const MATH_TERM_EN = {
            '极限': 'limits', '导数': 'derivatives', '微分': 'differential', '积分': 'integral',
            '不定积分': 'indefinite integral', '定积分': 'definite integral', '多元函数': 'multivariable functions',
            '偏导数': 'partial derivatives', '梯度': 'gradient', '方向导数': 'directional derivative',
            '泰勒级数': 'Taylor series', '麦克劳林级数': 'Maclaurin series', '幂级数': 'power series',
            '傅里叶级数': 'Fourier series', '微分方程': 'differential equation', '矩阵': 'matrix',
            '行列式': 'determinant', '特征值': 'eigenvalue', '特征向量': 'eigenvector', '线性变换': 'linear transformation',
            '向量空间': 'vector space', '概率': 'probability', '概率论': 'probability theory',
            '随机变量': 'random variable', '期望': 'expected value', '方差': 'variance', '正态分布': 'normal distribution',
            '连续性': 'continuity', '间断点': 'discontinuity', '中值定理': 'mean value theorem',
            '罗尔定理': 'Rolle theorem', '柯西定理': 'Cauchy theorem', '洛必达法则': 'L Hopital rule',
            '分部积分': 'integration by parts', '换元积分': 'integration by substitution',
            '二重积分': 'double integral', '三重积分': 'triple integral', '曲线积分': 'line integral',
            '曲面积分': 'surface integral', '格林公式': 'Green theorem', '高斯公式': 'divergence theorem',
            '斯托克斯公式': 'Stokes theorem', '级数': 'series', '收敛': 'convergence', '发散': 'divergence',
            '向量': 'vector', '线性无关': 'linear independence', '正交': 'orthogonal', '对角化': 'diagonalization',
            '二次型': 'quadratic form', '概率密度': 'probability density', '大数定律': 'law of large numbers',
            '中心极限定理': 'central limit theorem', '假设检验': 'hypothesis testing', '参数估计': 'parameter estimation'
        };
        // 把中文查询词翻译为英文数学术语（用于英语平台）
        function translateQueryToEnglish(query) {
            if (!query) return query;
            let result = query;
            // 先尝试整词匹配
            if (MATH_TERM_EN[query.trim()]) return MATH_TERM_EN[query.trim()];
            // 再做子串替换
            const sorted = Object.keys(MATH_TERM_EN).sort((a, b) => b.length - a.length);
            for (const zh of sorted) {
                if (result.includes(zh)) result = result.replace(new RegExp(zh, 'g'), MATH_TERM_EN[zh]);
            }
            // 如果没匹配到任何中文术语，返回原词（可能是英文或人名）
            return result;
        }
        // 根据平台语言选择检索关键词
        function pickQuery(platform, query) {
            return ENGLISH_PLATFORMS.has(platform) ? translateQueryToEnglish(query) : query;
        }
        // 清理搜索词：只保留文字和空格，去除连线符等无关符号
        function cleanRadarQuery(q) {
            return (q || '').replace(/[-_–—|/\\{}[\]()<>!@#$%^&*=+~`"'；;：:，,。.!？?、\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();
        }

        // ===== 本地模式：通过公共 CORS 代理抓取 Bing 搜索结果（不依赖后端） =====
        const RADAR_CORS_PROXIES = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?url=',
            'https://thingproxy.freeboard.io/fetch/'
        ];
        async function radarFetchViaProxy(targetUrl) {
            for (const proxy of RADAR_CORS_PROXIES) {
                try {
                    const ctrl = new AbortController();
                    const timer = setTimeout(() => ctrl.abort(), 9000);
                    const resp = await fetch(proxy + encodeURIComponent(targetUrl), {
                        method: 'GET',
                        headers: { 'Accept': 'text/html,application/json,*/*' },
                        signal: ctrl.signal
                    });
                    clearTimeout(timer);
                    if (resp.ok) {
                        const text = await resp.text();
                        if (text && text.length > 200) return text;
                    }
                } catch (e) { /* 尝试下一个代理 */ }
            }
            return '';
        }
        // 解析 Bing 搜索结果 HTML，提取具体内容链接（过滤搜索页）
        function radarParseBingHtml(html, siteFilter, platform, type, query) {
            if (!html) return [];
            const results = [];
            const blocks = html.split(/<li class="b_algo"/);
            for (let i = 1; i < blocks.length && results.length < 3; i++) {
                const block = blocks[i];
                const linkMatch = block.match(/href="(https?:\/\/[^"]+)"/);
                if (!linkMatch) continue;
                const link = linkMatch[1];
                if (/bing\.com|microsoft\.com|r\.bing|\/rs\//.test(link)) continue;
                if (/\.(css|js|png|jpg|svg|ico|woff)/.test(link)) continue;
                try {
                    const uLink = new URL(link);
                    const pathLower = (uLink.pathname || '').toLowerCase();
                    if (['/search', '/so/search'].some(p => pathLower.includes(p))) continue;
                    const sp = uLink.searchParams;
                    if (sp.get('q') || sp.get('keyword') || sp.get('query') || sp.get('page_search_query')) continue;
                    if (siteFilter && !uLink.hostname.includes(siteFilter.replace(/^www\./, ''))) continue;
                } catch (e) { continue; }
                const titleMatch = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
                let title = '';
                if (titleMatch) title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
                if (!title || title.length < 3) {
                    const pMatch = block.match(/<p class="b_lineclamp[12]"[^>]*>([\s\S]*?)<\/p>/);
                    if (pMatch) title = pMatch[1].replace(/<[^>]+>/g, '').trim();
                }
                if (!title) continue;
                results.push({
                    title: title, url: link, platform: platform,
                    type: type || 'article', difficulty: 5, duration: 15,
                    topics: [query], quality: 0.6, adRisk: 0.1
                });
            }
            return results;
        }
        // 通过 CORS 代理抓取 Bing 搜索：英语平台用英文关键词
        async function radarSearchViaBing(query, siteFilter, platform, type) {
            const useEng = platform === 'mitocw' || platform === 'khan';
            const qRaw = useEng ? translateQueryToEnglish(query) : query;
            let q = cleanRadarQuery(qRaw);
            if (siteFilter) q = `${q} site:${siteFilter}`;
            const searchUrl = `https://cn.bing.com/search?q=${encodeURIComponent(q)}&setlang=zh-CN`;
            const html = await radarFetchViaProxy(searchUrl);
            return radarParseBingHtml(html, siteFilter, platform, type, query);
        }
        // 各平台搜索（async，通过 CORS 代理）
        async function searchBilibili(query, opts = {}) {
            if (!query) return [];
            return radarSearchViaBing(query, 'bilibili.com', 'bilibili', 'video');
        }
        async function searchWebArticles(query, opts = {}) {
            if (!query) return [];
            const tasks = [
                radarSearchViaBing(query, 'zhihu.com', 'zhihu', 'article'),
                radarSearchViaBing(query, 'csdn.net', 'blog', 'notes'),
                radarSearchViaBing(query, 'ocw.mit.edu', 'mitocw', 'lecture'),
                radarSearchViaBing(query, 'khanacademy.org', 'khan', 'video'),
                radarSearchViaBing(query, 'geogebra.org', 'notes', 'interactive')
            ];
            const all = await Promise.all(tasks);
            const results = [];
            all.forEach(arr => results.push(...arr));
            return results;
        }
        async function searchCustomSite(siteUrl, query, opts = {}) {
            if (!query || !siteUrl) return [];
            let host = siteUrl;
            try { host = new URL(siteUrl).hostname; } catch (e) {}
            return radarSearchViaBing(query, host, 'custom', 'article');
        }
        function normalizeResourceResult(raw, source) {
            const url = raw.url || '';
            const title = raw.title || '';
            // Task 4: 自动识别资源类型（如果 raw 未指定）
            let type = raw.type;
            if (!type) type = detectResourceType(url, title);
            return {
                id: `${source || raw.platform}-${raw.url}`,
                title: title || '未命名资源',
                url: url,
                platform: raw.platform || source || 'unknown',
                type: type || 'article',
                difficulty: typeof raw.difficulty === 'number' ? raw.difficulty : 5,
                duration: raw.duration || 15,
                topics: Array.isArray(raw.topics) ? raw.topics : [],
                quality: typeof raw.quality === 'number' ? raw.quality : 0.5,
                adRisk: typeof raw.adRisk === 'number' ? raw.adRisk : 0
            };
        }
        // Task 4: 根据 URL 和标题识别资源类型
        function detectResourceType(url, title) {
            const u = (url || '').toLowerCase();
            const t = (title || '').toLowerCase();
            if (/\/video\/|bilibili\.com\/video|youtube\.com\/watch|youtu\.be\//.test(u)) return 'video';
            if (/题目|真题|试题|练习题|problem|exercise|question/.test(t) || /\/problem|\/question|\/exercise/.test(u)) return 'question';
            if (/题解|解答|solution|答案/.test(t) || /\/solution/.test(u)) return 'solution';
            if (/ocw\.mit\.edu|lecture|课程|讲义|课件|syllabus/.test(t) || /\/courses\/|\/lecture/.test(u)) return 'lecture';
            if (/geogebra\.org\/m\/|交互|演示|interactive|simulation/.test(t) || /\/m\/|\/interactive/.test(u)) return 'interactive';
            if (/笔记|notes|学习笔记/.test(t) || /\/notes/.test(u)) return 'notes';
            if (/zhuanlan\.zhihu\.com|blog\.|article|专栏|文章/.test(t) || /\/p\/|\/article|\/post/.test(u)) return 'article';
            return 'article';
        }
        function rankResources(results, ctx) {
            // ctx = { keywords: [], weakTopics: [], userLevel: 5, subject: 'all', weights, feedback, adKeywords, difficultyTolerance }
            const w = ctx.weights || { relevance: 0.35, weaknessMatch: 0.25, quality: 0.20, difficultyFit: 0.10, userFeedback: 0.10 };
            const keywords = (ctx.keywords || []).filter(Boolean).map(s => s.toLowerCase());
            const weakTopics = (ctx.weakTopics || []).map(s => s.toLowerCase());
            const adKeywords = (ctx.adKeywords || []).map(s => s.toLowerCase());
            const userLevel = ctx.userLevel || 5;
            const tolerance = ctx.difficultyTolerance || 2;
            return results.map(r => {
                const titleLower = (r.title || '').toLowerCase();
                const topicLower = (r.topics || []).map(t => t.toLowerCase());
                const relevance = keywords.length ? keywords.filter(k => titleLower.includes(k) || topicLower.some(t => t.includes(k))).length / keywords.length : 0.5;
                const weaknessMatch = weakTopics.length ? (weakTopics.some(wt => titleLower.includes(wt) || topicLower.some(t => t.includes(wt))) ? 1 : 0) : 0;
                const quality = typeof r.quality === 'number' ? r.quality : 0.5;
                const difficultyFit = Math.max(0, 1 - Math.abs((r.difficulty || 5) - userLevel) / 10);
                const fb = ctx.feedback || {};
                const userFeedback = fb.useful && fb.useful[r.id] ? 0.5 : (fb.useless && fb.useless[r.id] ? -0.5 : 0);
                const adRiskPenalty = (r.adRisk || 0) >= 0.3 || adKeywords.some(ak => titleLower.includes(ak)) ? 0.3 : (r.adRisk || 0) * 0.5;
                const subjectMismatchPenalty = ctx.subject && ctx.subject !== 'all' && r.topics && r.topics.length && !r.topics.some(t => t.toLowerCase().includes(ctx.subject)) ? 0.2 : 0;
                const rankScore = relevance * w.relevance + weaknessMatch * w.weaknessMatch + quality * w.quality + difficultyFit * w.difficultyFit + userFeedback * w.userFeedback - adRiskPenalty - subjectMismatchPenalty;
                return Object.assign({}, r, { _rank: { relevance, weaknessMatch, quality, difficultyFit, userFeedback, adRiskPenalty, subjectMismatchPenalty, rankScore } });
            }).sort((a, b) => (b._rank.rankScore || 0) - (a._rank.rankScore || 0));
        }

        // ===== Task 5: tab 切换与渲染入口 =====
        function renderRadar() {
            if (!$('radarScreen')) return;
            const tab = state.radar.activeTab;
            $$('.radar-tabs .mode-tab').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.radarTab === tab);
            });
            $$('.radar-panel').forEach(p => {
                p.classList.toggle('active', p.dataset.radarPanel === tab);
            });
            if (tab === 'search') renderRadarSearchHint();
            if (tab === 'weak') renderRadarWeak();
            if (tab === 'results') renderRadarResults();
            if (tab === 'favorites') renderRadarFav();
            if (tab === 'settings') renderRadarSettings();
        }
        function switchRadarTab(tabId) {
            state.radar.activeTab = tabId;
            renderRadar();
        }
        function bindRadarTabClicks() {
            $$('.radar-tabs .mode-tab').forEach(btn => {
                if (btn._radarBound) return;
                btn._radarBound = true;
                btn.addEventListener('click', () => switchRadarTab(btn.dataset.radarTab));
            });
        }

        // ===== Task 6: 智能检索表单逻辑 =====
        function bindRadarForm() {
            // 多选 option-btn 切换
            const multiGroups = [
                { el: $('radarGoalOptions'), key: 'goals' },
                { el: $('radarPlatformOptions'), key: 'platforms' },
                { el: $('radarTypeOptions'), key: 'types' }
            ];
            multiGroups.forEach(g => {
                if (!g.el || g.el._radarBound) return;
                g.el._radarBound = true;
                g.el.addEventListener('click', e => {
                    const btn = e.target.closest('.option-btn');
                    if (!btn) return;
                    btn.classList.toggle('selected');
                    const selected = Array.from(g.el.querySelectorAll('.option-btn.selected')).map(b => b.dataset.value);
                    state.radar.form[g.key] = selected;
                    // 自定义选项：选中时显示对应输入框
                    if (g.key === 'goals') {
                        const customInput = $('radarGoalCustom');
                        if (customInput) customInput.hidden = !btn.classList.contains('selected') || btn.dataset.value !== 'custom';
                    } else if (g.key === 'platforms') {
                        const customInput = $('radarPlatformCustom');
                        if (customInput) customInput.hidden = !btn.classList.contains('selected') || btn.dataset.value !== 'custom';
                    }
                });
            });
            // 自定义输入框同步到 form
            const goalCustom = $('radarGoalCustom');
            if (goalCustom && !goalCustom._radarBound) { goalCustom._radarBound = true; goalCustom.addEventListener('input', () => state.radar.form.customGoal = goalCustom.value.trim()); }
            const platCustom = $('radarPlatformCustom');
            if (platCustom && !platCustom._radarBound) { platCustom._radarBound = true; platCustom.addEventListener('input', () => state.radar.form.customPlatform = platCustom.value.trim()); }
            // 单选 subject
            const subjEl = $('radarSubjectOptions');
            if (subjEl && !subjEl._radarBound) {
                subjEl._radarBound = true;
                subjEl.addEventListener('click', e => {
                    const btn = e.target.closest('.option-btn');
                    if (!btn) return;
                    subjEl.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    state.radar.form.subject = btn.dataset.value;
                });
            }
            // 关键词、难度
            const kw = $('radarKeyword');
            if (kw && !kw._radarBound) { kw._radarBound = true; kw.addEventListener('input', () => state.radar.form.keyword = kw.value.trim()); }
            const diff = $('radarDifficulty');
            if (diff && !diff._radarBound) {
                diff._radarBound = true;
                diff.addEventListener('input', () => {
                    state.radar.form.difficulty = parseInt(diff.value, 10);
                    $('radarDifficultyValue').textContent = 'L' + diff.value;
                });
            }
            // 提交、重置
            const sb = $('radarSearchBtn');
            if (sb && !sb._radarBound) { sb._radarBound = true; sb.addEventListener('click', submitRadarSearch); }
            const rb = $('radarResetBtn');
            if (rb && !rb._radarBound) { rb._radarBound = true; rb.addEventListener('click', resetRadarForm); }
            // 薄弱匹配加入检索按钮
            const wab = $('radarWeakAddBtn');
            if (wab && !wab._radarBound) { wab._radarBound = true; wab.addEventListener('click', applyWeakToSearch); }
            // 来源设置
            bindRadarSettings();
            // 笔记 modal
            bindRadarNoteModal();
            // 重试
            const rtr = $('radarRetryBtn');
            if (rtr && !rtr._radarBound) { rtr._radarBound = true; rtr.addEventListener('click', runRadarSearch); }
            // Task 1: 自定义可折叠区块（替代 <details>）
            const hiddenToggle = $('radarHiddenToggle');
            if (hiddenToggle && !hiddenToggle._radarBound) {
                hiddenToggle._radarBound = true;
                hiddenToggle.addEventListener('click', () => {
                    const section = $('radarHiddenSection');
                    if (!section) return;
                    const open = section.classList.toggle('open');
                    hiddenToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                });
            }
            // 本地模式提示
            updateRadarLocalHint();
        }
        function submitRadarSearch() {
            const f = state.radar.form;
            // Task 4: 自定义学习目标/平台也可作为搜索起点
            if (!f.keyword && state.radar.weakSelection.size === 0 && !f.customGoal && !f.customPlatform) {
                const tip = $('radarFormTip');
                if (tip) { tip.textContent = '请输入关键词、自定义学习目标或勾选薄弱知识点开始搜索'; tip.style.display = 'block'; }
                return;
            }
            const tip = $('radarFormTip');
            if (tip) { tip.textContent = ''; tip.style.display = 'none'; }
            switchRadarTab('results');
            runRadarSearch();
        }
        function resetRadarForm() {
            state.radar.form = { keyword: '', goals: [], platforms: [], types: [], subject: 'all', difficulty: 8, customGoal: '', customPlatform: '' };
            state.radar.weakSelection = new Set();
            const kw = $('radarKeyword'); if (kw) kw.value = '';
            const diff = $('radarDifficulty'); if (diff) { diff.value = 8; $('radarDifficultyValue').textContent = 'L8'; }
            [$('radarGoalOptions'), $('radarPlatformOptions'), $('radarTypeOptions')].forEach(el => {
                if (el) el.querySelectorAll('.option-btn.selected').forEach(b => b.classList.remove('selected'));
            });
            const subjEl = $('radarSubjectOptions');
            if (subjEl) {
                subjEl.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                const allBtn = subjEl.querySelector('[data-value="all"]');
                if (allBtn) allBtn.classList.add('selected');
            }
            const gc = $('radarGoalCustom'); if (gc) { gc.value = ''; gc.hidden = true; }
            const pc = $('radarPlatformCustom'); if (pc) { pc.value = ''; pc.hidden = true; }
            const tip = $('radarFormTip'); if (tip) tip.style.display = 'none';
        }
        function renderRadarSearchHint() {
            const hint = $('radarWeakHint');
            if (!hint) return;
            const analysis = safeComputeStatsAnalysis();
            const weak = analysis?.weakTopics || [];
            if (weak.length === 0) { hint.hidden = true; return; }
            hint.hidden = false;
            hint.innerHTML = `<span>检测到 ${weak.length} 个薄弱知识点，是否一键加入检索？</span><button id="radarHintAddBtn">加入检索</button>`;
            const addBtn = $('radarHintAddBtn');
            if (addBtn) addBtn.addEventListener('click', () => {
                state.radar.weakSelection = new Set(weak.map(w => `${w.subject}:${w.topic}`));
                switchRadarTab('weak');
                renderRadarWeak();
            });
        }
        function safeComputeStatsAnalysis() {
            try {
                if (typeof buildLearningAnalysis === 'function') return buildLearningAnalysis();
                if (typeof computeStatsAnalysis === 'function') return computeStatsAnalysis();
                return { weakTopics: [], staleTopics: [], untouchedImportant: [] };
            } catch (e) { return { weakTopics: [], staleTopics: [], untouchedImportant: [] }; }
        }
        function updateRadarLocalHint() {
            const hint = $('radarLocalHint');
            if (!hint) return;
            if (typeof isLocalFile !== 'undefined' && isLocalFile) {
                hint.hidden = false;
                hint.textContent = '本地模式：通过公共代理获取实时资源，若加载较慢或为空，请通过服务器（node server.js）访问以获得更稳定的结果。';
            } else {
                hint.hidden = true;
            }
        }

        // ===== Task 7: 薄弱匹配推导 =====
        function renderRadarWeak() {
            const listEl = $('radarWeakList');
            const emptyEl = $('radarWeakEmpty');
            if (!listEl) return;
            const analysis = safeComputeStatsAnalysis();
            const all = [].concat(analysis.weakTopics || [], analysis.staleTopics || [], analysis.untouchedImportant || []);
            if (!all.length) {
                listEl.innerHTML = '';
                if (emptyEl) emptyEl.hidden = false;
                // Task 6: 空状态隐藏分页器
                renderRadarPagination('radarWeakPagination', 1, 1, () => {});
                return;
            }
            if (emptyEl) emptyEl.hidden = true;
            // Task 6: 分页切片
            const pageSize = state.radar.weakPageSize;
            const pages = Math.max(1, Math.ceil(all.length / pageSize));
            state.radar.weakPage = Math.max(1, Math.min(state.radar.weakPage, pages));
            const start = (state.radar.weakPage - 1) * pageSize;
            const pageItems = all.slice(start, start + pageSize);
            listEl.innerHTML = pageItems.map(row => {
                const key = `${row.subject}:${row.topic}`;
                const checked = state.radar.weakSelection.has(key) ? 'checked' : '';
                const subjName = typeof getSubjectName === 'function' ? getSubjectName(row.subject) : row.subject;
                return `<div class="radar-weak-row">
                    <input type="checkbox" data-key="${escapeHtml(key)}" ${checked}>
                    <div class="weak-info">
                        <div class="weak-title">${escapeHtml(subjName)} · ${escapeHtml(row.topic)}</div>
                        <div class="weak-meta">已答 ${row.answered || 0} 题 / 正确率 <span class="weak-acc">${row.accuracy || 0}%</span></div>
                    </div>
                </div>`;
            }).join('');
            listEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.addEventListener('change', () => {
                    const key = cb.dataset.key;
                    if (cb.checked) state.radar.weakSelection.add(key);
                    else state.radar.weakSelection.delete(key);
                });
            });
            // Task 6: 渲染分页器
            renderRadarPagination('radarWeakPagination', state.radar.weakPage, pages, page => {
                state.radar.weakPage = page;
                renderRadarWeak();
            });
        }
        function applyWeakToSearch() {
            const keys = Array.from(state.radar.weakSelection);
            if (!keys.length) {
                const tip = $('radarFormTip');
                if (tip) { tip.textContent = '请先勾选至少一个薄弱知识点'; tip.style.display = 'block'; }
                return;
            }
            const keywords = keys.map(k => {
                const [subj, topic] = k.split(':');
                const subjName = typeof getSubjectName === 'function' ? getSubjectName(subj) : subj;
                return `${subjName} - ${topic}`;
            });
            const kw = $('radarKeyword');
            if (kw) {
                const existing = kw.value.trim();
                kw.value = existing ? `${existing}、${keywords.join('、')}` : keywords.join('、');
                state.radar.form.keyword = kw.value.trim();
            }
            switchRadarTab('search');
        }

        // ===== Task 9: 检索执行与结果渲染 =====
        async function runRadarSearch() {
            state.radar.loading = true;
            state.radar.error = '';
            // Task 6: 新检索重置回第 1 页
            state.radar.resultsPage = 1;
            renderRadarResults();
            updateRadarLocalHint();
            const f = state.radar.form;
            // Task 4: 自定义学习目标加入关键词
            const keywords = (f.keyword || '').split(/[、,，\s]+/).filter(Boolean);
            if (f.goals && f.goals.includes('custom') && f.customGoal) {
                f.customGoal.split(/[、,，\s]+/).filter(Boolean).forEach(w => { if (!keywords.includes(w)) keywords.push(w); });
            }
            const weakKeys = Array.from(state.radar.weakSelection).map(k => k.split(':')[1] || '');
            const userLevel = (state.perSubject && state.perSubject[f.subject] && state.perSubject[f.subject].levelSum && state.perSubject[f.subject].answered)
                ? Math.max(1, Math.round(state.perSubject[f.subject].levelSum / state.perSubject[f.subject].answered))
                : (state.allModeStats && state.allModeStats.answered ? Math.max(1, Math.round(state.allModeStats.levelSum / state.allModeStats.answered)) : 5);
            let rawResults = [];
            let usedFallback = false;
            // Task 4: 检索查询串 = 关键词 + 自定义学习目标
            const queryStr = keywords.join(' ').trim() || f.keyword || weakKeys.join(' ') || '数学';
            // Task 4: 把自定义平台网址附加到请求
            const customPlatformUrl = (f.platforms && f.platforms.includes('custom') && f.customPlatform) ? f.customPlatform : '';
            // 优先后端：1) 配置的 Serverless Worker 地址 2) 本地服务器 /api/resources/search
            const workerUrl = (settings.radar && settings.radar.workerUrl || '').trim();
            const backendUrl = workerUrl
                ? workerUrl.replace(/\/+$/, '') + '/api/resources/search'
                : ((typeof isLocalFile === 'undefined' || !isLocalFile) ? '/api/resources/search' : '');
            if (backendUrl) {
                try {
                    const resp = await fetch(backendUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: queryStr, keywords, platforms: f.platforms, types: f.types, subject: f.subject, difficulty: f.difficulty, weakTopics: weakKeys, customGoal: f.customGoal || '', customPlatform: customPlatformUrl })
                    });
                    if (resp.ok) {
                        const data = await resp.json();
                        if (data && Array.isArray(data.results) && data.results.length) {
                            rawResults = data.results.map(r => normalizeResourceResult(r, r.platform));
                        } else if (data && data.ok === false) {
                            usedFallback = true; // 后端未实现，降级
                        }
                    } else { usedFallback = true; }
                } catch (e) { usedFallback = true; }
            } else { usedFallback = true; }
            // 降级：本地模式且未配置 Worker 时，通过 CORS 代理抓取 Bing 搜索结果
            if (usedFallback || !rawResults.length) {
                const platforms = f.platforms.length ? f.platforms : Object.keys(settings.radar.sources).filter(k => settings.radar.sources[k].enabled);
                const q = queryStr;
                for (const p of platforms) {
                    if (p === 'custom') continue; // 自定义平台单独处理
                    if (!settings.radar.sources[p] || !settings.radar.sources[p].enabled) continue;
                    let arr = [];
                    try {
                        if (p === 'bilibili') arr = await searchBilibili(q);
                        else if (p === 'mitocw' || p === 'khan' || p === 'zhihu' || p === 'blog' || p === 'notes') {
                            arr = (await searchWebArticles(q)).filter(r => r.platform === p);
                        }
                    } catch (e) { arr = []; }
                    rawResults = rawResults.concat(arr.map(r => normalizeResourceResult(r, p)));
                }
                // 来源设置中已配置的自定义站点
                for (const cs of (settings.radar.customSites || [])) {
                    if (!cs.enabled) continue;
                    let arr = [];
                    try { arr = await searchCustomSite(cs.url, q); } catch (e) { arr = []; }
                    rawResults = rawResults.concat(arr.map(r => normalizeResourceResult(r, 'custom')));
                }
                // Task 4: 智能检索中"自定义"平台输入的网址
                if (customPlatformUrl) {
                    let arr = [];
                    try { arr = await searchCustomSite(customPlatformUrl, q); } catch (e) { arr = []; }
                    rawResults = rawResults.concat(arr.map(r => normalizeResourceResult(r, 'custom')));
                }
                // 类型筛选
                if (f.types.length) rawResults = rawResults.filter(r => f.types.includes(r.type));
                // 难度上限筛选
                rawResults = rawResults.filter(r => r.difficulty <= f.difficulty);
                // 最低质量分
                const minQ = settings.radar.filters.minQuality;
                rawResults = rawResults.filter(r => r.quality >= minQ);
            }
            // 排序
            const ranked = rankResources(rawResults, {
                keywords, weakTopics: weakKeys, userLevel, subject: f.subject,
                weights: settings.radar.rankWeights, feedback: resourceFeedback,
                adKeywords: settings.radar.filters.adKeywords,
                difficultyTolerance: settings.radar.filters.difficultyTolerance
            });
            // 过滤被隐藏的
            state.radar.results = ranked.filter(r => !resourceFeedback.hidden[r.id]);
            state.radar.loading = false;
            renderRadarResults();
        }
        function renderRadarResults() {
            const wrap = $('radarResults');
            const loading = $('radarLoading');
            const errEl = $('radarError');
            const errText = $('radarErrorText');
            const empty = $('radarEmpty');
            if (!wrap) return;
            if (state.radar.loading) {
                loading.hidden = false; errEl.hidden = true; empty.hidden = true; wrap.innerHTML = '';
                renderRadarPagination('radarResultsPagination', 1, 1, () => {});
                return;
            }
            loading.hidden = true;
            if (state.radar.error) {
                errEl.hidden = false; errText.textContent = state.radar.error; empty.hidden = true; wrap.innerHTML = '';
                renderRadarPagination('radarResultsPagination', 1, 1, () => {});
                return;
            }
            errEl.hidden = true;
            if (!state.radar.results.length) {
                empty.hidden = false; wrap.innerHTML = '';
                renderRadarPagination('radarResultsPagination', 1, 1, () => {});
                return;
            }
            empty.hidden = true;
            // Task 6: 分页切片
            const pageSize = state.radar.resultsPageSize;
            const total = state.radar.results.length;
            const pages = Math.max(1, Math.ceil(total / pageSize));
            state.radar.resultsPage = Math.max(1, Math.min(state.radar.resultsPage, pages));
            const start = (state.radar.resultsPage - 1) * pageSize;
            const pageItems = state.radar.results.slice(start, start + pageSize);
            wrap.innerHTML = pageItems.map(r => renderRadarResultCard(r)).join('');
            bindRadarResultActions();
            renderRadarPagination('radarResultsPagination', state.radar.resultsPage, pages, page => {
                state.radar.resultsPage = page;
                renderRadarResults();
            });
        }
        function renderRadarResultCard(r) {
            const fav = resourceFeedback.favorited[r.id];
            const platformName = RADAR_PLATFORM_NAMES[r.platform] || (r.platform === 'custom' ? '自定义站点' : r.platform);
            const typeName = RADAR_TYPE_NAMES[r.type] || r.type;
            const topics = (r.topics || []).map(t => `<span class="radar-result-tag topic-tag">${escapeHtml(t)}</span>`).join('');
            const rk = r._rank || {};
            const scoreStr = rk.rankScore !== undefined ? `综合分 ${rk.rankScore.toFixed(3)} · 相关度 ${(rk.relevance || 0).toFixed(2)} · 薄弱 ${rk.weaknessMatch} · 质量 ${(rk.quality || 0).toFixed(2)} · 难度匹配 ${(rk.difficultyFit || 0).toFixed(2)} · 用户反馈 ${(rk.userFeedback || 0).toFixed(2)} · 广告惩罚 ${(rk.adRiskPenalty || 0).toFixed(2)} · 科目惩罚 ${(rk.subjectMismatchPenalty || 0).toFixed(2)}` : '';
            // Task 5: 有用/无用 选中态
            const usefulOn = !!resourceFeedback.useful[r.id];
            const uselessOn = !!resourceFeedback.useless[r.id];
            return `<div class="radar-result-card" data-id="${escapeHtml(r.id)}">
                <div class="radar-result-title">${escapeHtml(r.title)}</div>
                <div class="radar-result-tags">
                    <span class="radar-result-tag">${escapeHtml(platformName)}</span>
                    <span class="radar-result-tag type-tag">${escapeHtml(typeName)}</span>
                    ${topics}
                    <span class="radar-type-badge" title="${escapeHtml(typeName)}"><span class="rt-icon" data-t="${escapeHtml(r.type || 'article')}"></span><span class="rt-name">${escapeHtml(typeName)}</span></span>
                </div>
                <div class="radar-result-meta">
                    <span>难度 <b>L${r.difficulty}</b></span>
                    <span>预计 <b>${r.duration}</b> 分钟</span>
                </div>
                <div class="radar-result-reason">${escapeHtml(buildRadarReason(r))}</div>
                ${scoreStr ? `<div class="radar-result-score">${scoreStr}</div>` : ''}
                <div class="radar-result-actions">
                    <button data-act="open">打开</button>
                    <button data-act="fav" class="${fav ? 'favorited' : ''}" ${fav ? 'disabled' : ''}>${fav ? '已收藏' : '收藏'}</button>
                    <button data-act="hide" class="danger">隐藏</button>
                    <button data-act="copy">复制链接</button>
                    <button data-act="note">加入笔记</button>
                    <button data-act="useful" class="${usefulOn ? 'useful-on' : ''}">有用</button>
                    <button data-act="useless" class="${uselessOn ? 'useless-on' : ''} danger">无用</button>
                </div>
            </div>`;
        }
        function buildRadarReason(r) {
            const rk = r._rank || {};
            if (rk.weaknessMatch === 1 && r.topics.length) return `匹配你最近错题较多的：${r.topics.join('、')}`;
            if (rk.relevance >= 0.5) return `关键词高度相关：${r.topics.join('、') || r.title}`;
            if (rk.quality >= 0.8) return `来源质量较高（${RADAR_PLATFORM_NAMES[r.platform] || r.platform}）`;
            return `综合相关度与难度匹配推荐`;
        }
        function bindRadarResultActions() {
            $$('.radar-result-card').forEach(card => {
                if (card._radarBound) return;
                card._radarBound = true;
                card.addEventListener('click', e => {
                    const btn = e.target.closest('button[data-act]');
                    if (!btn) return;
                    const id = card.dataset.id;
                    const act = btn.dataset.act;
                    // 优先从当前结果集取，其次从缓存取（用于收藏/笔记面板）
                    const r = state.radar.results.find(x => x.id === id) || getCachedResource(id);
                    if (act === 'open') {
                        if (r && r.url) window.open(r.url, '_blank', 'noopener');
                    } else if (act === 'fav') { favoriteResource(id); }
                    else if (act === 'hide') { hideResource(id); }
                    else if (act === 'copy') {
                        // Task 3: 复制链接到剪贴板
                        const url = r && r.url;
                        if (!url) return;
                        const done = () => {
                            const orig = btn.textContent;
                            btn.textContent = '已复制';
                            btn.classList.add('copied');
                            setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
                        };
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(url).then(done).catch(() => fallbackCopy(url, done));
                        } else { fallbackCopy(url, done); }
                    }
                    else if (act === 'note') { openRadarNoteModal(id); }
                    else if (act === 'useful') { markResourceUseful(id, true); }
                    else if (act === 'useless') { markResourceUseful(id, false); }
                });
            });
        }
        // Task 3: 兼容旧浏览器的复制方法
        function fallbackCopy(text, cb) {
            try {
                const ta = document.createElement('textarea');
                ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
                document.body.appendChild(ta); ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                if (typeof cb === 'function') cb();
            } catch (e) { console.warn('copy failed', e); }
        }

        // ===== Task 10: 收藏与笔记交互 =====
        function favoriteResource(id) {
            if (resourceFeedback.favorited[id]) return;
            resourceFeedback.favorited[id] = true;
            delete resourceFeedback.hidden[id];
            // Task 1: 缓存完整资源信息，避免后续渲染丢失
            const r = state.radar.results.find(x => x.id === id);
            if (r) cacheResource(r);
            saveRadarStore();
            renderRadarResults();
        }
        function hideResource(id) {
            resourceFeedback.hidden[id] = true;
            // Task 1: 缓存完整资源信息，便于在"已隐藏"列表中显示标题与恢复
            const r = state.radar.results.find(x => x.id === id);
            if (r) cacheResource(r);
            saveRadarStore();
            state.radar.results = state.radar.results.filter(r => r.id !== id);
            renderRadarResults();
        }
        function restoreResource(id) {
            delete resourceFeedback.hidden[id];
            saveRadarStore();
            renderRadarFav();
        }
        // Task 5: "有用"/"无用" 可切换；再次点击同项则取消选择
        function markResourceUseful(id, useful) {
            const wasUseful = !!resourceFeedback.useful[id];
            const wasUseless = !!resourceFeedback.useless[id];
            delete resourceFeedback.useful[id];
            delete resourceFeedback.useless[id];
            if (useful && !wasUseful) resourceFeedback.useful[id] = true;
            else if (!useful && !wasUseless) resourceFeedback.useless[id] = true;
            saveRadarStore();
            // Task 5: 重新渲染当前激活面板（结果页或收藏页均可能用到）
            renderRadar();
        }
        let _radarNoteTargetId = null;
        function openRadarNoteModal(id) {
            _radarNoteTargetId = id;
            const r = state.radar.results.find(x => x.id === id) || getCachedResource(id) || (resourceFeedback.favorited[id] ? { title: '已收藏资源', topics: [] } : null);
            if ($('radarNoteText')) $('radarNoteText').value = (resourceNotes[id] && resourceNotes[id].text) || '';
            if ($('radarNoteQuestionIds')) $('radarNoteQuestionIds').value = ((resourceNotes[id] && resourceNotes[id].questionIds) || []).join(', ');
            if ($('radarNoteTopics')) $('radarNoteTopics').value = ((resourceNotes[id] && resourceNotes[id].topics) || (r && r.topics) || []).join(', ');
            // Task 2: 修复 modal 显示 class（CSS 使用 .show 而非 .active）
            if ($('radarNoteModal')) $('radarNoteModal').classList.add('show');
        }
        function closeRadarNoteModal() {
            if ($('radarNoteModal')) $('radarNoteModal').classList.remove('show');
            _radarNoteTargetId = null;
        }
        function saveRadarNote() {
            if (!_radarNoteTargetId) return;
            const text = ($('radarNoteText') && $('radarNoteText').value || '').trim();
            const qids = (($('radarNoteQuestionIds') && $('radarNoteQuestionIds').value) || '').split(/[,，\s]+/).filter(Boolean);
            const topics = (($('radarNoteTopics') && $('radarNoteTopics').value) || '').split(/[,，\s]+/).filter(Boolean);
            resourceNotes[_radarNoteTargetId] = { text, questionIds: qids, topics, createdAt: Date.now() };
            // Task 2: 缓存资源信息，便于笔记列表显示标题
            const r = state.radar.results.find(x => x.id === _radarNoteTargetId);
            if (r) cacheResource(r);
            saveRadarStore();
            closeRadarNoteModal();
            // Task 2: 保存后刷新当前面板，让笔记立即出现在收藏/笔记页
            renderRadar();
        }
        function bindRadarNoteModal() {
            const cancel = $('radarNoteCancelBtn');
            const save = $('radarNoteSaveBtn');
            const modal = $('radarNoteModal');
            if (cancel && !cancel._radarBound) { cancel._radarBound = true; cancel.addEventListener('click', closeRadarNoteModal); }
            if (save && !save._radarBound) { save._radarBound = true; save.addEventListener('click', saveRadarNote); }
            if (modal && !modal._radarBound) {
                modal._radarBound = true;
                const backdrop = modal.querySelector('.modal-backdrop');
                if (backdrop) backdrop.addEventListener('click', closeRadarNoteModal);
            }
        }
        function renderRadarFav() {
            const favList = $('radarFavList');
            const hiddenList = $('radarHiddenList');
            const notesList = $('radarNotesList');
            if (favList) {
                const favIds = Object.keys(resourceFeedback.favorited);
                if (!favIds.length) {
                    favList.innerHTML = '<div class="radar-weak-empty">暂无收藏，点击结果卡片上的"收藏"按钮。</div>';
                    renderRadarPagination('radarFavPagination', 1, 1, () => {});
                } else {
                    // Task 6: 收藏列表分页
                    const pageSize = state.radar.favoritesPageSize;
                    const pages = Math.max(1, Math.ceil(favIds.length / pageSize));
                    state.radar.favoritesPage = Math.max(1, Math.min(state.radar.favoritesPage, pages));
                    const start = (state.radar.favoritesPage - 1) * pageSize;
                    const pageIds = favIds.slice(start, start + pageSize);
                    // Task 1: 优先用缓存中的完整资源信息，避免切换/重渲染后丢失
                    favList.innerHTML = pageIds.map(id => {
                        const r = state.radar.results.find(x => x.id === id) || getCachedResource(id) || { id, title: '已收藏资源（请重新检索查看）', url: '#', platform: 'unknown', type: 'article', difficulty: 5, duration: 0, topics: [], quality: 0.5, _rank: {} };
                        return renderRadarResultCard(r);
                    }).join('');
                    bindRadarResultActions();
                    renderRadarPagination('radarFavPagination', state.radar.favoritesPage, pages, page => {
                        state.radar.favoritesPage = page;
                        renderRadarFav();
                    });
                }
            }
            if (hiddenList) {
                const hiddenIds = Object.keys(resourceFeedback.hidden);
                if (!hiddenIds.length) {
                    hiddenList.innerHTML = '<div class="radar-weak-empty">暂无隐藏资源。</div>';
                } else {
                    // Task 1: 用缓存信息渲染隐藏列表（含标题、平台、类型），不再是裸 ID
                    hiddenList.innerHTML = hiddenIds.map(id => {
                        const r = getCachedResource(id) || { id, title: id, url: '#', platform: 'unknown', type: 'article', difficulty: 5, duration: 0, topics: [], quality: 0.5 };
                        const platformName = RADAR_PLATFORM_NAMES[r.platform] || (r.platform === 'custom' ? '自定义站点' : r.platform);
                        const typeName = RADAR_TYPE_NAMES[r.type] || r.type;
                        return `<div class="radar-result-card" data-id="${escapeHtml(id)}">
                            <div class="radar-result-title">${escapeHtml(r.title || id)}</div>
                            <div class="radar-result-tags">
                                <span class="radar-result-tag">${escapeHtml(platformName)}</span>
                                <span class="radar-result-tag type-tag">${escapeHtml(typeName)}</span>
                                <span class="radar-type-badge" title="${escapeHtml(typeName)}"><span class="rt-icon" data-t="${escapeHtml(r.type || 'article')}"></span><span class="rt-name">${escapeHtml(typeName)}</span></span>
                            </div>
                            <div class="radar-result-actions">
                                <button data-act="open">打开</button>
                                <button data-restore="${escapeHtml(id)}">恢复显示</button>
                            </div>
                        </div>`;
                    }).join('');
                    hiddenList.querySelectorAll('button[data-restore]').forEach(b => {
                        b.addEventListener('click', () => restoreResource(b.dataset.restore));
                    });
                    // Task 1: 复用通用动作绑定（打开/复制链接 等使用缓存里的资源信息）
                    bindRadarResultActions();
                }
            }
            if (notesList) {
                const noteIds = Object.keys(resourceNotes);
                if (!noteIds.length) {
                    notesList.innerHTML = '<div class="radar-weak-empty">暂无笔记，点击结果卡片上的"加入笔记"按钮。</div>';
                    renderRadarPagination('radarNotesPagination', 1, 1, () => {});
                } else {
                    // Task 6: 笔记列表分页
                    const pageSize = state.radar.notesPageSize;
                    const pages = Math.max(1, Math.ceil(noteIds.length / pageSize));
                    state.radar.notesPage = Math.max(1, Math.min(state.radar.notesPage, pages));
                    const start = (state.radar.notesPage - 1) * pageSize;
                    const pageIds = noteIds.slice(start, start + pageSize);
                    notesList.innerHTML = pageIds.map(id => {
                        const n = resourceNotes[id];
                        const cached = getCachedResource(id);
                        const displayTitle = (cached && cached.title) || id;
                        return `<div class="radar-note-card">
                            <div class="note-title">${escapeHtml(displayTitle)}</div>
                            <div class="note-body">${escapeHtml(n.text)}</div>
                            <div class="note-meta">关联错题：${escapeHtml((n.questionIds || []).join(', ') || '无')} · 知识点：${escapeHtml((n.topics || []).join(', ') || '无')} · ${new Date(n.createdAt || 0).toLocaleString()}</div>
                        </div>`;
                    }).join('');
                    renderRadarPagination('radarNotesPagination', state.radar.notesPage, pages, page => {
                        state.radar.notesPage = page;
                        renderRadarFav();
                    });
                }
            }
        }

        // ===== Task 11: 来源设置 =====
        function renderRadarSettings() {
            const listEl = $('radarSourceList');
            if (listEl) {
                listEl.innerHTML = Object.keys(settings.radar.sources).map(key => {
                    const s = settings.radar.sources[key];
                    const name = RADAR_PLATFORM_NAMES[key] || key;
                    return `<div class="radar-source-row" data-key="${escapeHtml(key)}">
                        <span class="src-name">${escapeHtml(name)}</span>
                        <button class="src-toggle ${s.enabled ? 'on' : ''}" data-toggle="${escapeHtml(key)}"></button>
                        <div class="src-quality">
                            <input type="range" min="0" max="100" value="${Math.round(s.quality * 100)}" data-quality="${escapeHtml(key)}">
                            <span class="src-quality-val">${Math.round(s.quality * 100)}%</span>
                        </div>
                    </div>`;
                }).join('');
                listEl.querySelectorAll('[data-toggle]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const key = btn.dataset.toggle;
                        settings.radar.sources[key].enabled = !settings.radar.sources[key].enabled;
                        btn.classList.toggle('on', settings.radar.sources[key].enabled);
                    });
                });
                listEl.querySelectorAll('[data-quality]').forEach(input => {
                    input.addEventListener('input', () => {
                        const key = input.dataset.quality;
                        const val = parseInt(input.value, 10);
                        settings.radar.sources[key].quality = val / 100;
                        const valSpan = input.parentElement.querySelector('.src-quality-val');
                        if (valSpan) valSpan.textContent = val + '%';
                    });
                });
            }
            renderRadarCustomSites();
            const wInput = $('radarWorkerUrl');
            if (wInput) {
                wInput.value = settings.radar.workerUrl || '';
                if (!wInput._radarBound) { wInput._radarBound = true; wInput.addEventListener('input', () => {
                    settings.radar.workerUrl = (wInput.value || '').trim();
                }); }
            }
            const adInput = $('radarAdKeywords');
            if (adInput) adInput.value = (settings.radar.filters.adKeywords || []).join(', ');
            const minQ = $('radarMinQuality');
            if (minQ) {
                minQ.value = Math.round(settings.radar.filters.minQuality * 100);
                $('radarMinQualityValue').textContent = minQ.value + '%';
                if (!minQ._radarBound) { minQ._radarBound = true; minQ.addEventListener('input', () => {
                    settings.radar.filters.minQuality = parseInt(minQ.value, 10) / 100;
                    $('radarMinQualityValue').textContent = minQ.value + '%';
                }); }
            }
            const dt = $('radarDifficultyTolerance');
            if (dt) {
                dt.value = settings.radar.filters.difficultyTolerance;
                $('radarDifficultyToleranceValue').textContent = dt.value + ' 级';
                if (!dt._radarBound) { dt._radarBound = true; dt.addEventListener('input', () => {
                    settings.radar.filters.difficultyTolerance = parseInt(dt.value, 10);
                    $('radarDifficultyToleranceValue').textContent = dt.value + ' 级';
                }); }
            }
            const saveBtn = $('radarSaveSettingsBtn');
            if (saveBtn && !saveBtn._radarBound) {
                saveBtn._radarBound = true;
                saveBtn.addEventListener('click', () => {
                    const adEl = $('radarAdKeywords');
                    if (adEl) settings.radar.filters.adKeywords = (adEl.value || '').split(/[,，\s]+/).filter(Boolean);
                    if (typeof saveData === 'function') saveData();
                    saveRadarStore();
                    const btn = $('radarSaveSettingsBtn');
                    const orig = btn.textContent;
                    btn.textContent = '已保存'; btn.disabled = true;
                    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1200);
                });
            }
        }
        function renderRadarCustomSites() {
            const wrap = $('radarCustomSites');
            if (!wrap) return;
            const sites = settings.radar.customSites || [];
            if (!sites.length) {
                wrap.innerHTML = '<div class="radar-weak-empty">暂无自定义站点。</div>';
                return;
            }
            wrap.innerHTML = sites.map((cs, i) => `<div class="radar-custom-row">
                <span class="cs-name">${escapeHtml(cs.name || '未命名')}</span>
                <span class="cs-url">${escapeHtml(cs.url)}</span>
                <button data-cs-toggle="${i}">${cs.enabled ? '禁用' : '启用'}</button>
                <button data-cs-del="${i}">删除</button>
            </div>`).join('');
            wrap.querySelectorAll('[data-cs-toggle]').forEach(b => b.addEventListener('click', () => {
                const i = parseInt(b.dataset.csToggle, 10);
                settings.radar.customSites[i].enabled = !settings.radar.customSites[i].enabled;
                renderRadarCustomSites();
            }));
            wrap.querySelectorAll('[data-cs-del]').forEach(b => b.addEventListener('click', () => {
                const i = parseInt(b.dataset.csDel, 10);
                settings.radar.customSites.splice(i, 1);
                renderRadarCustomSites();
            }));
        }
        function bindRadarSettings() {
            const addBtn = $('radarCustomAddBtn');
            if (addBtn && !addBtn._radarBound) {
                addBtn._radarBound = true;
                addBtn.addEventListener('click', () => {
                    const urlEl = $('radarCustomUrl');
                    const nameEl = $('radarCustomName');
                    const url = urlEl && urlEl.value.trim();
                    const name = nameEl && nameEl.value.trim();
                    if (!url) return;
                    settings.radar.customSites.push({ url, name: name || url, enabled: true });
                    if (urlEl) urlEl.value = '';
                    if (nameEl) nameEl.value = '';
                    renderRadarCustomSites();
                });
            }
        }

