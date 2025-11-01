"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaRegistry = exports.SchemaRegistry = exports.slotsParamsJsonSchema = exports.cardsParamsJsonSchema = exports.rouletteParamsJsonSchema = exports.plinkoParamsJsonSchema = exports.cryptolaunchParamsJsonSchema = exports.coinflipParamsJsonSchema = exports.rpsParamsJsonSchema = exports.crashParamsJsonSchema = exports.bombsParamsJsonSchema = exports.diceParamsJsonSchema = exports.SlotsParamsSchema = exports.CardsParamsSchema = exports.RouletteParamsSchema = exports.PlinkoParamsSchema = exports.CryptoLaunchParamsSchema = exports.CoinFlipParamsSchema = exports.RPSParamsSchema = exports.CrashParamsSchema = exports.BombsParamsSchema = exports.DiceParamsSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const zod_to_json_schema_1 = require("zod-to-json-schema");
const schemaInstructionExtractor_1 = require("./schemaInstructionExtractor");
const logger = new common_1.Logger('AI');
const isValidHexColor = (color) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
const HexColorSchema = zod_1.z.string().refine(isValidHexColor, 'Must be valid hex color');
const AnimationDurationSchema = zod_1.z.number().min(0.1).max(10);
const PercentageSchema = zod_1.z.number().min(0).max(1);
const ImageSpecs = {
    icon: {
        size: '1024x1024',
        quality: 'medium',
        format: 'png',
        background: 'transparent',
    },
    background: {
        size: '1024x1024',
        quality: 'high',
        format: 'png',
        background: 'opaque',
    },
    general: {
        size: '1024x1024',
        quality: 'low',
        format: 'png',
        background: 'auto',
    },
};
exports.DiceParamsSchema = zod_1.z
    .object({
    gameIcon: zod_1.z
        .string()
        .optional()
        .describe('Custom icon image for the game tile. Supports images only. Generate an image prompt for a themed icon.')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.icon,
            customInstruction: 'Generate a square icon image representing dice or the theme of this dice game. Should be clear and recognizable at small sizes (64x64px). Use simple, bold designs with transparent background. Consider incorporating dice imagery or thematic elements that match the overall design of the game or casino.',
        },
    }),
    background: zod_1.z
        .string()
        .default('#121212')
        .describe('Main game background. Supports gradient, alpha, and images. Prefer generating an image prompt that matches the theme.')
        .refine(val => val, {
        params: {
            ...ImageSpecs.background,
            customInstruction: 'The dice is placed in the center of the screen, so avoid generating a background that is busy or cluttered in the center.',
        },
    }),
    diceColor: zod_1.z
        .string()
        .default('#5f5fff')
        .describe('Main color of the dice (for non-custom models). Solid colors only.'),
    diceImage: zod_1.z
        .string()
        .optional()
        .describe('Custom dice texture/image (for custom model). Supports images only. Prefer generating an image prompt for a themed dice texture.')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.general,
            customInstruction: 'Generate a square image to represent a single face of a die.',
        },
    }),
    textColor: zod_1.z
        .string()
        .default('#ffffff')
        .describe('Color of text on the dice and UI elements. Solid color only.'),
    diceSize: zod_1.z.number().min(40).max(200).default(120).describe('Size of the dice in pixels.'),
    animationSpeed: zod_1.z
        .number()
        .min(200)
        .max(2000)
        .default(1200)
        .describe('Speed of dice animation in milliseconds.'),
    winColor: zod_1.z
        .string()
        .default('#00ff00')
        .describe('Color used for winning outcome visual feedback. Solid color only. Should represent a positive outcome and prioritize visibility with the background image'),
    loseColor: zod_1.z
        .string()
        .default('#ff0000')
        .describe('Color used for losing outcome visual feedback. Solid color only. Should represent a negative outcome and prioritize visibility with the background image'),
    animationPreset: zod_1.z
        .enum(['simple', 'thump', 'spin'])
        .default('simple')
        .describe('Predefined animation style for the dice roll. Simple: Dice lifts up, rolls, and lands. Thump: Dice lifts up, rolls, and lands with a thump. Spin: Dice spins and lands. Thump: Dice lifts up, and slams down. Spin: Dice spins in place 90 degrees, 4 times.'),
    diceModel: zod_1.z
        .enum(['wireframe', 'solid', 'neon', 'custom'])
        .default('wireframe')
        .describe('Visual style of the dice model. If using an image for dice color, set to custom. Wireframe is simple flat, solid is modern with shadows, neon is laser-like outline. Prefer custom.'),
})
    .describe('Schema for Dice game design parameters (visuals only).');
exports.BombsParamsSchema = zod_1.z
    .object({
    gameIcon: zod_1.z
        .string()
        .optional()
        .describe('Custom icon image for the game tile. Supports images only. Generate an image prompt for a themed icon.')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.icon,
            customInstruction: 'Generate a square icon image representing bombs/mines or the theme of this bombs game. Should be clear and recognizable at small sizes (64x64px). Use simple, bold designs with transparent background. Consider incorporating explosive imagery, danger symbols, or thematic elements that match the overall design.',
        },
    }),
    background: zod_1.z
        .string()
        .default('#1a1a1a')
        .describe('Main game background. Supports gradient, alpha, and images. Prefer generating an image prompt that matches the theme.')
        .refine(val => val, {
        params: {
            ...ImageSpecs.background,
            customInstruction: 'The board is centered in the middle of the window and takes up most of it. Focus interesting elements near the borders of the image. DO NOT generate a grid or board in the image.',
        },
    }),
    tileColor: zod_1.z
        .string()
        .default('#2a2a2a')
        .describe('Default tile appearance. Supports gradient and images. Prefer generating an image prompt for a themed tile texture.')
        .refine(val => val, {
        params: {
            ...ImageSpecs.general,
            customInstruction: 'Generate a square tile texture for unselected game tiles. Consider themed surfaces that suggest hidden contents.',
        },
    }),
    selectedTileColor: zod_1.z
        .string()
        .default('#3a3a3a')
        .describe('Selected tile appearance. Supports gradient and images. Prefer generating an image prompt for a highlighted tile texture.')
        .refine(val => val, {
        params: {
            ...ImageSpecs.general,
            customInstruction: 'Generate a square tile texture showing selection state. Add elements that suggest a more "activated" state.',
        },
    }),
    bombColor: zod_1.z
        .string()
        .default('#ff4444')
        .describe('Bomb tile appearance. Supports gradient and images. Prefer generating an image prompt for a themed bomb design.')
        .refine(val => val, {
        params: {
            ...ImageSpecs.general,
            customInstruction: 'Generate a square tile showing a revealed bomb or mine. Feel free to be creative, but make it clearly distinguishable as a losing tile.',
        },
    }),
    safeColor: zod_1.z
        .string()
        .default('#44ff44')
        .describe('Safe tile appearance. Supports gradient and images. Prefer generating an image prompt for a themed safe tile design.')
        .refine(val => val, {
        params: {
            ...ImageSpecs.general,
            customInstruction: 'Generate a square tile showing a safe/cleared space. Include success indicators, treasure, gems, or positive symbols that match the game theme. Make it clearly distinguishable as a winning tile.',
        },
    }),
    tileShape: zod_1.z
        .enum(['square', 'round'])
        .default('square')
        .describe('Shape of the game tiles (square or round). Prefer square unless round fits the theme better.'),
    tileSize: zod_1.z
        .number()
        .min(40)
        .max(120)
        .default(75)
        .describe('Size of each game tile in pixels. Bigger shows more detail, smaller is a more modern look.'),
    tileSpacing: zod_1.z
        .number()
        .min(0)
        .max(20)
        .default(8)
        .describe('Spacing between game tiles in pixels.'),
    borderColor: zod_1.z
        .string()
        .default('#000000')
        .describe('Default tile border color. Solid color only.'),
    selectedBorderColor: zod_1.z
        .string()
        .default('#4a4a4a')
        .describe('Selected tile border color. Solid color only.'),
    winColor: zod_1.z
        .string()
        .default('#44ff44')
        .describe('Border color for winning state. Solid color only.'),
    lossColor: zod_1.z
        .string()
        .default('#ff4444')
        .describe('Border color for losing state. Solid color only.'),
    particleEffects: zod_1.z
        .enum(['none', 'less', 'more'])
        .default('less')
        .describe('Level of particle effects when revealing tiles.'),
})
    .describe('Schema for Bombs game design parameters (visuals only).');
exports.CrashParamsSchema = zod_1.z
    .object({
    gameIcon: zod_1.z
        .string()
        .optional()
        .describe('Custom icon image for the game tile. Supports images only. Generate an image prompt for a themed icon.')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.icon,
            customInstruction: 'Generate a square icon image representing crash/rocket or the theme of this crash game. Should be clear and recognizable at small sizes (64x64px). Use simple, bold designs with transparent background. Consider incorporating rocket, graph, or upward trajectory imagery that matches the overall design.',
        },
    }),
    background: zod_1.z
        .string()
        .default('#1a1a1a')
        .describe('Background of the crash graph game. Supports gradient, alpha, and images. Prefer dark themes for better contrast.')
        .refine(val => val, {
        params: {
            ...ImageSpecs.background,
            customInstruction: 'The graph is centered in the middle of the window. Focus interesting elements near the borders of the image. Avoid busy backgrounds',
        },
    }),
    lineColor: zod_1.z
        .string()
        .default('#00ff00')
        .describe('Color of the rising crash line. Solid color only. Bright colors work best for visibility.'),
    gridColor: zod_1.z
        .string()
        .default('#333333')
        .describe('Color of the grid lines on the graph. Solid color only.'),
    gridTextColor: zod_1.z
        .string()
        .default('#666666')
        .describe('Color of grid labels and text. Solid color only. Target legibility considering the background style'),
    textColor: zod_1.z
        .string()
        .default('#ffffff')
        .describe('Color of text elements and multiplier display. Solid color only. Target legibility considering the background style'),
    crashColor: zod_1.z
        .string()
        .default('#ff0000')
        .describe('Color used when the crash occurs (loss). Solid color only.'),
    winColor: zod_1.z
        .string()
        .default('#00ff00')
        .describe('Color used for successful cash out visual feedback (win). Solid color only.'),
    axesColor: zod_1.z
        .string()
        .default('#ffffff')
        .describe('Color of the main axes lines. Solid color only.'),
    gameSpeed: zod_1.z
        .number()
        .min(1)
        .max(10)
        .default(5)
        .describe('Speed of the game (higher = faster/shorter duration). Prefer 3-5.'),
    showGridlines: zod_1.z
        .boolean()
        .default(true)
        .describe('Whether to show grid lines on the graph. Enable for more busy/technical feel. Disable for clean/modern.'),
    showGridLabels: zod_1.z
        .boolean()
        .default(true)
        .describe('Whether to show labels on grid lines. Enable for more technical feel. Disable for clean/modern.'),
    showAxes: zod_1.z
        .boolean()
        .default(true)
        .describe('Whether to show main axes lines. Enable for more technical feel. Disable for clean/modern.'),
    showTargetLine: zod_1.z
        .boolean()
        .default(true)
        .describe('Whether to show the target cash out line. Prefer enable.'),
    lineThickness: zod_1.z
        .number()
        .min(1)
        .max(10)
        .default(3)
        .describe('Thickness of the crash line in pixels. Prefer lower values'),
    graphSize: zod_1.z
        .number()
        .min(200)
        .max(500)
        .default(400)
        .describe('Size of the graph (height in pixels, width scales proportionally).'),
    rocketAppearance: zod_1.z
        .string()
        .default('#ff6b6b')
        .describe('Rocket visual appearance. Supports solid colors, gradients, or images.')
        .refine(val => val, {
        params: {
            ...ImageSpecs.icon,
            customInstruction: 'Generate rocket/spaceship icons with TRANSPARENT BACKGROUNDS. The rocket itself can be filled with thematic colors/patterns, but NO flames, exhaust, or trails unless explicitly requested in the theme. Focus on the rocket body/ship design only. Make it suitable for a game icon.',
            supportsImage: true,
            supportsSolidColor: true,
            supportsGradient: true,
        },
    }),
    rocketSize: zod_1.z.number().min(20).max(100).default(40).describe('Relative size of the rocket.'),
})
    .describe('Schema for Crash game design parameters (visuals only).');
exports.RPSParamsSchema = zod_1.z
    .object({
    gameIcon: zod_1.z
        .string()
        .optional()
        .describe('Custom icon image for the game tile. Supports images only. Generate an image prompt for a themed icon.')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.icon,
            customInstruction: 'Generate a square icon image representing rock-paper-scissors or the theme of this RPS game. Should be clear and recognizable at small sizes (64x64px). Use simple, bold designs with transparent background. Consider incorporating hand gestures, RPS symbols, or thematic elements that match the overall design.',
        },
    }),
    background: zod_1.z
        .string()
        .default('#1a1a1a')
        .describe('Main game background. Supports gradient, alpha, and images. Prefer generating an image prompt that matches the theme.')
        .refine(val => val, {
        params: {
            ...ImageSpecs.background,
            customInstruction: 'Hands render in the vertical middle of the window. Avoid clutter in the center so hands and effects remain legible.',
        },
    }),
    handSize: zod_1.z.number().min(40).max(200).default(120).describe('Size of the hands in pixels.'),
    handSpacing: zod_1.z
        .number()
        .min(40)
        .max(240)
        .default(100)
        .describe('Horizontal space between the two hands in pixels.'),
    primaryColor: zod_1.z
        .string()
        .default('#3498db')
        .describe('Primary color for game elements like icons or UI accents. Solid color only.'),
    secondaryColor: zod_1.z
        .string()
        .default('#2980b9')
        .describe('Secondary color for game elements, complementing the primary. Solid color only.'),
    winColor: zod_1.z
        .string()
        .default('#2ecc71')
        .describe('Color used for winning outcome display. Solid color only.'),
    loseColor: zod_1.z
        .string()
        .default('#e74c3c')
        .describe('Color used for losing outcome display. Solid color only.'),
    useCustomIcons: zod_1.z
        .boolean()
        .default(false)
        .describe('Whether to use custom images for rock/paper/scissors hands. Prefer true.'),
    customRockImage: zod_1.z
        .string()
        .optional()
        .describe('Custom image URL for rock hand (only if useCustomIcons is true).')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.icon,
            customInstruction: 'Generate a square, LEFT hand rock gesture icon with a transparent background. Keep it simple and recognizable at small sizes. Center the hand and avoid cropping fingertips. You may choose to render non-hand objects to if the theme calls for it, but make sure if it is a hand, it is a left hand.',
        },
    }),
    customPaperImage: zod_1.z
        .string()
        .optional()
        .describe('Custom image URL for paper hand (only if useCustomIcons is true).')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.icon,
            customInstruction: 'Generate a square, LEFT open hand (paper) icon with a transparent background. Keep it simple and recognizable at small sizes. Center the hand and avoid cropping fingertips. You may choose to render non-hand objects to if the theme calls for it, but make sure if it is a hand, it is a left hand.',
        },
    }),
    customScissorsImage: zod_1.z
        .string()
        .optional()
        .describe('Custom image URL for scissors hand (only if useCustomIcons is true).')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.icon,
            customInstruction: 'Generate a square, LEFT hand scissors gesture icon with a transparent background. Keep it simple and recognizable at small sizes. Center the hand and avoid cropping fingertips. You may choose to render non-hand objects to if the theme calls for it, but make sure if it is a hand, it is a left hand.',
        },
    }),
    animationSpeed: zod_1.z
        .number()
        .min(500)
        .max(3000)
        .default(1500)
        .describe('Duration of game animations in milliseconds.'),
    animationPreset: zod_1.z
        .enum(['standard', 'clash'])
        .default('standard')
        .describe('Predefined animation style for game events. Standard: simple hand animations. Clash: hands clash and bounce.'),
    showResultText: zod_1.z
        .boolean()
        .default(true)
        .describe('Whether to show the WIN/LOSE/DRAW text overlay (and accompanying particles).'),
    showVsText: zod_1.z
        .boolean()
        .default(true)
        .describe('Whether to show the VS text between hands.'),
    glowEffect: zod_1.z.boolean().default(true).describe('Whether to show glow effects.'),
})
    .describe('Schema for Rock-Paper-Scissors (RPS) game design parameters (visuals only).');
exports.CoinFlipParamsSchema = zod_1.z
    .object({
    gameIcon: zod_1.z
        .string()
        .optional()
        .describe('Custom icon image for the game tile. Supports images only. Generate an image prompt for a themed icon.')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.icon,
            customInstruction: 'Generate a square icon image representing coin flip or the theme of this coin flip game. Should be clear and recognizable at small sizes (64x64px). Use simple, bold designs with transparent background. Consider incorporating coin imagery, flip motion, or thematic elements that match the overall design.',
        },
    }),
    background: zod_1.z
        .string()
        .default('#1a1a1a')
        .describe('Main game background. Supports gradient, alpha, and images. Prefer generating an image prompt that matches the theme.')
        .refine(val => val, {
        params: {
            ...ImageSpecs.background,
            customInstruction: 'The coin is placed in the center of the screen, so try to create a background image that has an empty center focal point.',
        },
    }),
    coinColor: zod_1.z
        .string()
        .default('#ffd700')
        .describe('Main color/texture of the coin. Supports gradient and images. Prefer generating an image prompt for a themed coin texture.'),
    headsCustomImage: zod_1.z
        .string()
        .describe('Custom image URL for heads side. Required field for coin face customization.')
        .refine(val => val, {
        params: {
            ...ImageSpecs.general,
            customInstruction: 'Generate a square image to represent the coin face design for "heads". Prefer to include portraits or statues representing a head of any type of being, or symbolic imagery. Add text around the edge in a circular pattern if appropriate. Make it distinct from tails.',
        },
    }),
    tailsCustomImage: zod_1.z
        .string()
        .describe('Custom image URL for tails side. Required field for coin face customization.')
        .refine(val => val, {
        params: {
            ...ImageSpecs.general,
            customInstruction: 'Generate a square image to represent the coin face design for "tails". Prefer to include architectural elements, symbols, emblems, or crests. Should complement but contrast with the heads design.',
        },
    }),
    textColor: zod_1.z
        .string()
        .default('#ffffff')
        .describe('Color of text on the coin and UI elements. Solid color only. Target legibility considering the background style'),
    coinSize: zod_1.z.number().min(50).max(300).default(150).describe('Relative size of the coin.'),
    animationSpeed: zod_1.z
        .number()
        .min(500)
        .max(5000)
        .default(2000)
        .describe('Duration of coin flip animation in milliseconds.'),
    flipCount: zod_1.z
        .number()
        .min(3)
        .max(10)
        .default(5)
        .describe('Number of flips in the animation. Fewer for snappy animation'),
    particleCount: zod_1.z
        .number()
        .min(0)
        .max(100)
        .default(30)
        .describe('Number of particles emitted on win.'),
    animationPreset: zod_1.z
        .enum(['flip', 'spin', 'twist'])
        .default('flip')
        .describe('Type of animation preset to use for the coin flip.'),
    winColor: zod_1.z
        .string()
        .default('#00ff00')
        .describe('Color used for winning outcome visual feedback. Solid color only.'),
    lossColor: zod_1.z
        .string()
        .default('#ff0000')
        .describe('Color used for losing outcome visual feedback. Solid color only.'),
    particleEffects: zod_1.z
        .enum(['none', 'less', 'more'])
        .default('less')
        .describe('Level of particle effects during coin flip.'),
    glowEffect: zod_1.z.boolean().default(false).describe('Whether to show glow effect around the coin.'),
})
    .describe('Schema for CoinFlip game design parameters (visuals only).');
exports.CryptoLaunchParamsSchema = zod_1.z
    .object({
    gameIcon: zod_1.z
        .string()
        .optional()
        .describe('Custom icon image for the game tile. Supports images only. Generate an image prompt for a themed icon.')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.icon,
            customInstruction: 'Generate a square icon image representing crypto launch or the theme of this crypto launch game. Should be clear and recognizable at small sizes (64x64px). Use simple, bold designs with transparent background. Consider incorporating rocket, crypto symbols, charts, or thematic elements that match the overall design.',
        },
    }),
    chartColor: zod_1.z
        .string()
        .default('#00ff00')
        .describe('Color of the price chart line. Solid color only.'),
    background: zod_1.z
        .string()
        .default('#1a1a1a')
        .describe('Background of the game area. Supports gradient, alpha, and images. Prefer generating an image prompt that matches the theme.'),
    highlightOpacity: zod_1.z
        .number()
        .min(0)
        .max(1)
        .default(0.3)
        .describe('Opacity of highlight effects.'),
    showXAxis: zod_1.z
        .boolean()
        .default(true)
        .describe('Whether to show X-axis on the chart. Enable for more nerdy feel. Disable for clean.'),
    showDayLabels: zod_1.z
        .boolean()
        .default(true)
        .describe('Whether to show start and end day labels on X-axis. Enable for more technical feel'),
    showGrid: zod_1.z.boolean().default(true).describe('Whether to show grid lines on the chart.'),
    gridColor: zod_1.z
        .string()
        .default('#333333')
        .describe('Color of grid lines on the chart. Solid color only.'),
    textColor: zod_1.z.string().default('#ffffff').describe('Color of text elements. Solid color only.'),
    particleIntensity: zod_1.z
        .number()
        .min(1)
        .max(10)
        .default(5)
        .describe('Intensity of particle effects (1-10).'),
    animationDuration: zod_1.z
        .number()
        .min(1000)
        .max(60000)
        .default(10000)
        .describe('Duration of price animation in milliseconds. Prefer <10000'),
})
    .describe('Schema for CryptoLaunch game design parameters (visuals only).');
exports.PlinkoParamsSchema = zod_1.z
    .object({
    gameIcon: zod_1.z
        .string()
        .optional()
        .describe('Custom icon image for the game tile. Supports images only. Generate an image prompt for a themed icon.')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.icon,
            customInstruction: 'Generate a square icon image representing plinko or the theme of this plinko game. Should be clear and recognizable at small sizes (64x64px). Use simple, bold designs with transparent background. Consider incorporating ball/peg imagery, cascading elements, or thematic elements that match the overall design.',
        },
    }),
    background: zod_1.z
        .string()
        .default('#1a1a1a')
        .describe('Game background. Supports gradient, alpha, and images. Prefer generating an image prompt that matches a Plinko theme.')
        .refine(val => val, {
        params: {
            ...ImageSpecs.background,
            customInstruction: 'The plinko pegs sit in a triangle and take up most of the window. The background image should account for this. Do not make the center area too busy. More interesting background elements should be located towards the top-left, top-right, or borders of the image.',
        },
    }),
    ballColor: zod_1.z.string().default('#ff6b6b').describe('Ball color. Solid color only.'),
    pegColor: zod_1.z.string().default('#4ecdc4').describe('Peg color. Solid color only.'),
    bucketColor: zod_1.z
        .string()
        .default('#2a2a2a')
        .describe('Bucket background color or texture. Supports gradient or solid colors.'),
    bucketOutlineColor: zod_1.z
        .string()
        .default('#ffffff')
        .describe('Bucket outline color that appears when a ball hits a bucket. Supports solid colors with alpha transparency.'),
    multiplierColor: zod_1.z
        .string()
        .default('#ffffff')
        .describe('Multiplier text color. Supports solid colors and radial gradients. Radial gradients apply from center outward across all multipliers, and can be used strategically to highlight higher multipliers.'),
    ballTrail: zod_1.z
        .boolean()
        .default(true)
        .describe('Enable/disable ball trail effects during animation.'),
    ballDropDelay: zod_1.z
        .number()
        .min(50)
        .max(1000)
        .default(200)
        .describe('Time in milliseconds between ball drops during multi-ball gameplay. Generally prefer lower numbers, unless you want a slower feel'),
    showBucketAnimations: zod_1.z
        .boolean()
        .default(true)
        .describe('Enable/disable bouncing animations when balls hit buckets. Prefer enable.'),
})
    .describe('Schema for Plinko game design parameters (visuals only).');
exports.RouletteParamsSchema = zod_1.z
    .object({
    gameIcon: zod_1.z
        .string()
        .optional()
        .describe('Custom icon image for the game tile. Supports images only. Generate an image prompt for a themed icon.')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.icon,
            customInstruction: 'Generate a square icon image representing roulette or the theme of this roulette game. Should be clear and recognizable at small sizes (64x64px). Use simple, bold designs with transparent background. Consider incorporating wheel, ball, numbers, or thematic elements that match the overall design.',
        },
    }),
    layoutType: zod_1.z
        .enum(['spin', 'scroll', 'tiles'])
        .default('spin')
        .describe('Main layout type: spin (traditional wheel), tiles (grid with glow effects). Prefer spin or tiles.'),
    textColor: zod_1.z
        .string()
        .default('#ffffff')
        .describe('Color of text on tiles and UI elements. Solid color only. Target brighter, legible colors that contrast with the roulette colors.'),
    rouletteColor1: zod_1.z
        .string()
        .default('#dc2626')
        .describe('Color for typically red numbers on the roulette wheel. Solid color only.'),
    rouletteColor2: zod_1.z
        .string()
        .default('#171717')
        .describe('Color for typically black numbers on the roulette wheel. Solid color only.'),
    neutralColor: zod_1.z
        .string()
        .default('#16a34a')
        .describe('Color for the 0 tile (traditionally green). Solid color only.'),
    spinDuration: zod_1.z
        .number()
        .min(2000)
        .max(10000)
        .default(5000)
        .describe('Duration of the main game animation in milliseconds.'),
    resetDuration: zod_1.z
        .number()
        .min(500)
        .max(3000)
        .default(1500)
        .describe('Duration for game to reset to starting position in milliseconds.'),
    wheelRadius: zod_1.z
        .number()
        .min(150)
        .max(300)
        .optional()
        .describe('Size of the roulette wheel in pixels (only for spin layout).'),
    wheelAccentColor: zod_1.z
        .string()
        .optional()
        .describe('Color for wheel borders and accent elements (only for spin layout).'),
    wheelBackground: zod_1.z
        .string()
        .optional()
        .describe('Background inside the wheel area - supports images, gradients, etc. (only for spin layout).')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.general,
            customInstruction: 'Image should be square. Will be cropped into a circle in the center of a roulette wheel.',
        },
    }),
    scrollSpeed: zod_1.z
        .number()
        .min(1000)
        .max(10000)
        .optional()
        .describe('Initial velocity of the scrolling animation (only for scroll layout).'),
    decelerationRate: zod_1.z
        .number()
        .min(0.9)
        .max(0.99)
        .optional()
        .describe('How quickly the scroll slows down (only for scroll layout).'),
    neighborOpacity: zod_1.z
        .number()
        .min(0.1)
        .max(1)
        .optional()
        .describe('Opacity of numbers adjacent to the active one (only for scroll layout).'),
    visibleNeighbors: zod_1.z
        .number()
        .min(1)
        .max(5)
        .optional()
        .describe('How many numbers to show on each side of the active number (only for scroll layout).'),
    numberSize: zod_1.z
        .number()
        .min(20)
        .max(100)
        .optional()
        .describe('Size of the displayed numbers in pixels (only for scroll layout).'),
    tileSize: zod_1.z
        .number()
        .min(30)
        .max(60)
        .optional()
        .describe('Size of individual tiles in pixels (only for tiles layout).'),
    tileSpacing: zod_1.z
        .number()
        .min(1)
        .max(30)
        .optional()
        .describe('Gap between tiles in pixels (only for tiles layout).'),
    tileBorderRadius: zod_1.z
        .number()
        .min(1)
        .max(50)
        .optional()
        .describe('Corner rounding for tiles (only for tiles layout).'),
    tileBorderHighlightColor: zod_1.z
        .string()
        .optional()
        .describe('Color for active tile borders during animation (only for tiles layout).'),
    animationPattern: zod_1.z
        .enum(['sequential', 'random', 'waterfall'])
        .optional()
        .describe('Pattern for tile illumination during gameplay (only for tiles layout).'),
    chipColors: zod_1.z
        .array(zod_1.z.string())
        .min(3)
        .max(10)
        .default(['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'])
        .describe('Colors for different chip denominations. Array of solid colors.'),
    showBettingHistory: zod_1.z
        .boolean()
        .default(true)
        .describe('Whether to show recent betting history.'),
})
    .describe('Schema for Roulette game design parameters (visuals only).');
exports.CardsParamsSchema = zod_1.z
    .object({
    gameIcon: zod_1.z
        .string()
        .optional()
        .describe('Custom icon image for the game tile. Supports images only. Generate an image prompt for a themed icon.')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.icon,
            supportsImage: true,
            supportsSolidColor: false,
            supportsGradient: false,
            customInstruction: 'Generate a bold, simple emblem for the pack-opening cards game. Keep a TRANSPARENT background; ensure visibility at small sizes.',
        },
    }),
    background: zod_1.z
        .object({ url: zod_1.z.string() })
        .describe('Main game background. Supports gradient, alpha, and images. Prefer generating an image prompt that matches the theme.')
        .refine(() => true, {
        params: {
            ...ImageSpecs.background,
            supportsImage: true,
            supportsGradient: true,
            supportsSolidColor: true,
            customInstruction: 'Create an atmospheric background that does not distract from pack animations. Prefer subtle gradients or soft-focus imagery at the edges.',
        },
    }),
    commonColor: zod_1.z.string().optional().describe('Color for common rarity cards.'),
    rareColor: zod_1.z.string().optional().describe('Color for rare rarity cards.'),
    epicColor: zod_1.z.string().optional().describe('Color for epic rarity cards.'),
    legendaryColor: zod_1.z.string().optional().describe('Color for legendary rarity cards.'),
    cardsCatalog: zod_1.z
        .array(zod_1.z.object({
        id: zod_1.z.number().int().positive().describe('Unique identifier for the card'),
        name: zod_1.z
            .string()
            .min(1)
            .describe('Card display name. The AI should create thematic, evocative names.'),
        iconUrl: zod_1.z
            .string()
            .describe('Card image URL. Prefer images over emojis; use square, transparent backgrounds.')
            .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
            params: {
                ...ImageSpecs.icon,
                customInstruction: 'Images should be cohesive with the theme of the game, and indicative of the rarity of the card.',
            },
        }),
    }))
        .length(18)
        .describe('Visible card collection with a FIXED SIZE of 18 items (Tier 1: 3, Tier 2: 6, Tier 3: 9). For each item, generate a name and use an image placeholder (image:card_<id>) with matching imagePrompts. Prefer square, transparent PNG images.'),
})
    .describe('Schema for Cards game design parameters (visuals only).');
exports.SlotsParamsSchema = zod_1.z
    .object({
    gameIcon: zod_1.z
        .string()
        .optional()
        .describe('Custom icon image for the game tile. Supports images only. Generate an image prompt for a themed icon.')
        .refine(val => val === undefined || val === null || val === '' || typeof val === 'string', {
        params: {
            ...ImageSpecs.icon,
            supportsImage: true,
            customInstruction: 'Generate an icon for the slots game that meshes with the theme of the casino and the game.',
        },
    }),
    background: zod_1.z
        .object({ url: zod_1.z.string().describe('Background image, gradient, or color.') })
        .describe('Main game background. Supports images, gradients, or solid colors via the url field. Prefer unobtrusive imagery around the reel area.')
        .refine(() => true, {
        params: {
            ...ImageSpecs.background,
            supportsImage: true,
            supportsGradient: true,
            supportsSolidColor: true,
        },
    }),
    reelBackground: zod_1.z
        .string()
        .describe('Background inside each reel. Supports solid colors, linear gradients, radial gradients, and alpha transparency.')
        .refine(() => true, {
        params: {
            supportsSolidColor: true,
            supportsGradient: true,
            supportsImage: false,
        },
    }),
    reelContainer: zod_1.z
        .string()
        .describe('Background of the container holding all reels. Supports solid colors, linear gradients, radial gradients, and alpha transparency.')
        .refine(() => true, {
        params: {
            supportsSolidColor: true,
            supportsGradient: true,
            supportsImage: false,
        },
    }),
    borderColor: zod_1.z
        .string()
        .describe('Border color for container and reels. Solid color with alpha support.')
        .refine(() => true, { params: { supportsSolidColor: true } }),
    paylineIndicator: zod_1.z
        .string()
        .describe('Color of the center payline indicator. Solid color with alpha support.')
        .refine(() => true, { params: { supportsSolidColor: true } }),
    winColor: zod_1.z
        .string()
        .describe('Color for win indicators and effects. Solid color.')
        .refine(() => true, { params: { supportsSolidColor: true } }),
    slotsSymbols: zod_1.z
        .array(zod_1.z.string())
        .length(7)
        .describe('Array of exactly 7 symbol images/emojis (lowest to highest tier).'),
})
    .describe('Schema for Slots game design parameters (visuals only).');
exports.diceParamsJsonSchema = (0, zod_to_json_schema_1.zodToJsonSchema)(exports.DiceParamsSchema, 'diceParamsJsonSchema');
exports.bombsParamsJsonSchema = (0, zod_to_json_schema_1.zodToJsonSchema)(exports.BombsParamsSchema, 'bombsParamsJsonSchema');
exports.crashParamsJsonSchema = (0, zod_to_json_schema_1.zodToJsonSchema)(exports.CrashParamsSchema, 'crashParamsJsonSchema');
exports.rpsParamsJsonSchema = (0, zod_to_json_schema_1.zodToJsonSchema)(exports.RPSParamsSchema, 'rpsParamsJsonSchema');
exports.coinflipParamsJsonSchema = (0, zod_to_json_schema_1.zodToJsonSchema)(exports.CoinFlipParamsSchema, 'coinflipParamsJsonSchema');
exports.cryptolaunchParamsJsonSchema = (0, zod_to_json_schema_1.zodToJsonSchema)(exports.CryptoLaunchParamsSchema, 'cryptolaunchParamsJsonSchema');
exports.plinkoParamsJsonSchema = (0, zod_to_json_schema_1.zodToJsonSchema)(exports.PlinkoParamsSchema, 'plinkoParamsJsonSchema');
exports.rouletteParamsJsonSchema = (0, zod_to_json_schema_1.zodToJsonSchema)(exports.RouletteParamsSchema, 'rouletteParamsJsonSchema');
exports.cardsParamsJsonSchema = (0, zod_to_json_schema_1.zodToJsonSchema)(exports.CardsParamsSchema, 'cardsParamsJsonSchema');
exports.slotsParamsJsonSchema = (0, zod_to_json_schema_1.zodToJsonSchema)(exports.SlotsParamsSchema, 'slotsParamsJsonSchema');
class SchemaRegistry {
    constructor() {
        this.games = new Map();
        this.registerGames();
    }
    static getInstance() {
        if (!SchemaRegistry.instance) {
            SchemaRegistry.instance = new SchemaRegistry();
        }
        return SchemaRegistry.instance;
    }
    registerGames() {
        this.register('dice', {
            id: 'dice',
            displayName: 'Dice',
            description: 'Classic dice rolling game with customizable colors and animations',
            category: 'dice',
            tileSize: 'medium',
            supportedFeatures: ['colors', 'animations', 'particles', 'textures'],
            schema: exports.DiceParamsSchema
        });
        this.register('bombs', {
            id: 'bombs',
            displayName: 'Bombs',
            description: 'Minesweeper-style game with gem and bomb tiles',
            category: 'grid',
            tileSize: 'large',
            supportedFeatures: ['colors', 'animations', 'icons', 'shapes'],
            schema: exports.BombsParamsSchema
        });
        this.register('crash', {
            id: 'crash',
            displayName: 'Crash',
            description: 'Multiplier-based betting game with exponential growth',
            category: 'crash',
            tileSize: 'large',
            supportedFeatures: ['colors', 'gradients', 'animations', 'effects'],
            schema: exports.CrashParamsSchema
        });
        this.register('roulette', {
            id: 'roulette',
            displayName: 'Roulette',
            description: 'Classic wheel-based betting game',
            category: 'wheel',
            tileSize: 'large',
            supportedFeatures: ['colors', 'animations', 'sounds', 'styles'],
            schema: exports.RouletteParamsSchema
        });
        this.register('plinko', {
            id: 'plinko',
            displayName: 'Plinko',
            description: 'Ball drop game with pegs and buckets',
            category: 'grid',
            tileSize: 'large',
            supportedFeatures: ['colors', 'animations', 'physics', 'buckets'],
            schema: exports.PlinkoParamsSchema
        });
        this.register('rps', {
            id: 'rps',
            displayName: 'Rock Paper Scissors',
            description: 'Classic hand gesture game with customizable animations',
            category: 'rps',
            tileSize: 'medium',
            supportedFeatures: ['colors', 'animations', 'particles', 'custom_hands'],
            schema: exports.RPSParamsSchema
        });
        this.register('coinflip', {
            id: 'coinflip',
            displayName: 'Coin Flip',
            description: 'Simple coin flipping game with custom coin designs',
            category: 'coinflip',
            tileSize: 'medium',
            supportedFeatures: ['colors', 'animations', 'particles', 'custom_coins'],
            schema: exports.CoinFlipParamsSchema
        });
        this.register('cryptolaunch', {
            id: 'cryptolaunch',
            displayName: 'Crypto Launch',
            description: 'Cryptocurrency price simulation game',
            category: 'crypto',
            tileSize: 'large',
            supportedFeatures: ['colors', 'animations', 'charts', 'particles'],
            schema: exports.CryptoLaunchParamsSchema
        });
        this.register('cards', {
            id: 'cards',
            displayName: 'Card Pack Opening',
            description: 'Pack opening game with collectible cards',
            category: 'cards',
            tileSize: 'large',
            supportedFeatures: ['colors', 'animations', 'rarity_system', 'card_collection'],
            schema: exports.CardsParamsSchema
        });
        this.register('slots', {
            id: 'slots',
            displayName: 'Slot Machine',
            description: 'Classic slot machine with spinning reels',
            category: 'slots',
            tileSize: 'large',
            supportedFeatures: ['colors', 'animations', 'symbols', 'paylines'],
            schema: exports.SlotsParamsSchema
        });
        logger.log(`Schema registry initialized with ${this.games.size} games`);
    }
    register(id, metadata) {
        this.games.set(id, metadata);
    }
    getSchema(gameId) {
        const game = this.games.get(gameId);
        return game ? game.schema : null;
    }
    getJsonSchema(gameId) {
        switch (gameId) {
            case 'dice':
                return exports.diceParamsJsonSchema;
            case 'bombs':
                return exports.bombsParamsJsonSchema;
            case 'crash':
                return exports.crashParamsJsonSchema;
            case 'rps':
                return exports.rpsParamsJsonSchema;
            case 'coinflip':
                return exports.coinflipParamsJsonSchema;
            case 'cryptolaunch':
                return exports.cryptolaunchParamsJsonSchema;
            case 'roulette':
                return exports.rouletteParamsJsonSchema;
            case 'plinko':
                return exports.plinkoParamsJsonSchema;
            case 'cards':
                return exports.cardsParamsJsonSchema;
            case 'slots':
                return exports.slotsParamsJsonSchema;
            default:
                return null;
        }
    }
    validateParams(gameId, params) {
        const schema = this.getSchema(gameId);
        if (!schema) {
            return { success: false, error: `Unknown game: ${gameId}` };
        }
        try {
            const validatedData = schema.parse(params);
            return { success: true, data: validatedData };
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return { success: false, error: error.errors.map(e => e.message).join(', ') };
            }
            return { success: false, error: 'Validation failed' };
        }
    }
    listGames() {
        return Array.from(this.games.values());
    }
    getGameMetadata(gameId) {
        return this.games.get(gameId) || null;
    }
    extractAIInstructions(gameId) {
        const game = this.games.get(gameId);
        if (!game) {
            return {};
        }
        const instructions = {};
        const schema = game.schema;
        Object.keys(schema.shape).forEach(key => {
            const field = schema.shape[key];
            if (field._def && field._def.description) {
                instructions[key] = field._def.description;
            }
        });
        return instructions;
    }
    getSupportedGames() {
        return Array.from(this.games.keys());
    }
    isGameSupported(gameId) {
        return this.games.has(gameId);
    }
    extractCustomInstructions(gameId) {
        const schema = this.getSchema(gameId);
        if (!schema) {
            logger.warn(`No schema found for game: ${gameId}`);
            return '';
        }
        const instructions = (0, schemaInstructionExtractor_1.extractSchemaInstructions)(schema);
        return (0, schemaInstructionExtractor_1.formatInstructionsForPrompt)(instructions);
    }
    getSupportedTypesMetadata(gameId) {
        const schema = this.getSchema(gameId);
        if (!schema) {
            logger.warn(`No schema found for game: ${gameId}`);
            return {};
        }
        return (0, schemaInstructionExtractor_1.extractSupportedTypesMetadata)(schema);
    }
    getFieldInfo(gameId) {
        const schema = this.getSchema(gameId);
        if (!schema) {
            logger.warn(`No schema found for game: ${gameId}`);
            return [];
        }
        const metadata = (0, schemaInstructionExtractor_1.extractSupportedTypesMetadata)(schema);
        return Object.entries(metadata).map(([name, info]) => ({
            name,
            type: info.type || 'unknown',
            description: info.description || '',
            default: info.default,
            optional: info.optional || false,
            supportsImage: info.supportsImage || false,
            supportsGradient: info.supportsGradient || false,
            supportsSolidColor: info.supportsSolidColor || false,
            supportsPattern: info.supportsPattern || false,
            customInstruction: info.customInstruction,
        }));
    }
}
exports.SchemaRegistry = SchemaRegistry;
exports.schemaRegistry = SchemaRegistry.getInstance();
//# sourceMappingURL=schemaRegistry.js.map