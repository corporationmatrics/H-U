import { PhotoItem, ThemedAlbum, CoupleProfile, AlbumThemeCategory } from '../types';

/**
 * Checks if a given date string falls on a Friday, Saturday, or Sunday.
 */
function isWeekend(dateStr: string): boolean {
  try {
    const d = new Date(dateStr);
    const day = d.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
    return day === 0 || day === 5 || day === 6;
  } catch {
    return false;
  }
}

/**
 * Formats a clean date range string (e.g. "July 2024 - August 2025" or "Sep 1, 2023 - Sep 1, 2025")
 */
function formatDateRange(photos: PhotoItem[]): { rangeStr: string; start: string; end: string } {
  if (!photos.length) return { rangeStr: 'N/A', start: '', end: '' };
  
  const sorted = [...photos].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const first = new Date(sorted[0].date);
  const last = new Date(sorted[sorted.length - 1].date);

  const startFormatted = first.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  const endFormatted = last.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

  const rangeStr = startFormatted === endFormatted ? startFormatted : `${startFormatted} – ${endFormatted}`;
  return {
    rangeStr,
    start: sorted[0].date,
    end: sorted[sorted.length - 1].date,
  };
}

/**
 * Automatically groups photos from the library_index.json data structure into themed collections.
 */
export function generateAutomatedAlbums(photos: PhotoItem[], profile: CoupleProfile): ThemedAlbum[] {
  // Filter out clutter/receipt items for clean nostalgic curation
  const usablePhotos = photos.filter(p => !p.visualTriggers.isClutterOrReceipt);

  const albums: ThemedAlbum[] = [];

  // 1. Theme: 'Summer Vibes'
  // Logic: Months June (5), July (6), August (7) OR semantic tags / visual triggers (sunset, beach, road trip, sunglasses, coast, convertible, ocean)
  const summerKeywords = ['summer', 'beach', 'sunset', 'ocean', 'coast', 'convertible', 'sunglasses', 'highway 1', 'big sur', 'carmel'];
  const summerPhotos = usablePhotos.filter(p => {
    const d = new Date(p.date);
    const month = d.getMonth(); // 5 = Jun, 6 = Jul, 7 = Aug
    const isSummerMonth = month === 5 || month === 6 || month === 7;
    const hasSummerTag = (p.semanticTags || []).some(t => summerKeywords.some(kw => t.toLowerCase().includes(kw)));
    const hasSummerContext = p.context === 'Beach Getaway' || p.context === 'Road Trip' || (p.context === 'Golden Hour' && isSummerMonth);
    return isSummerMonth || hasSummerTag || hasSummerContext;
  });

  if (summerPhotos.length > 0) {
    const sorted = [...summerPhotos].sort((a, b) => b.aestheticScore - a.aestheticScore);
    const { rangeStr, start, end } = formatDateRange(summerPhotos);
    const locations = Array.from(new Set(summerPhotos.map(p => p.location.city || p.location.name))).filter(Boolean);
    const avgScore = Math.round(summerPhotos.reduce((acc, p) => acc + p.aestheticScore, 0) / summerPhotos.length);

    albums.push({
      id: 'album-summer-vibes',
      title: 'Summer Vibes & Coastal Sunsets',
      subtitle: `Sun-drenched road trips and warm Pacific breezes with ${profile.partner1Name} & ${profile.partner2Name}`,
      category: 'summer',
      badge: '☀️ Seasonal Collection',
      coverPhotoId: sorted[0].id,
      photoIds: summerPhotos.map(p => p.id),
      dateRange: rangeStr,
      startDate: start,
      endDate: end,
      primaryTags: ['Summer Roads', 'Golden Hour', 'Ocean Cliffs', 'Convertible'],
      matchedReasons: ['Grouped by summer months (June–August)', 'Matched coastal & sunset visual cues', 'High aesthetic score threshold'],
      nostalgicStory: `Warm wind in your hair, the top folded down on Highway 1, and the orange glow of the sun dipping into the ocean. These frames capture that unmistakable carefree feeling of summer together.`,
      locations,
      averageAestheticScore: avgScore,
      songSuggestion: {
        title: 'Sunset Lover (Acoustic)',
        artist: 'Petit Biscuit',
        vibe: 'Warm, breezy & golden',
      },
    });
  }

  // 2. Theme: 'Weekend Getaways'
  // Logic: Weekend dates (Fri-Sun) OR trips outside the home city (e.g. Big Sur, Val Gardena, Tokyo, Florence, Paris, Carmel, Rainier)
  const getawayPhotos = usablePhotos.filter(p => {
    const isWknd = isWeekend(p.date);
    const isTravelContext = p.context === 'Road Trip' || p.context === 'Mountain Hike' || p.context === 'Beach Getaway' || p.context === 'City Stroll';
    const isOutTown = p.location.city !== 'Seattle' && p.location.city !== 'Home';
    const hasGetawayTag = (p.semanticTags || []).some(t => /trip|getaway|flight|train|hotel|cabin|highway|cliffs|dolomites|tokyo|paris/i.test(t));
    return (isWknd && isTravelContext) || (isOutTown && isTravelContext) || hasGetawayTag;
  });

  if (getawayPhotos.length > 0) {
    const sorted = [...getawayPhotos].sort((a, b) => b.aestheticScore - a.aestheticScore);
    const { rangeStr, start, end } = formatDateRange(getawayPhotos);
    const locations = Array.from(new Set(getawayPhotos.map(p => p.location.city || p.location.name))).filter(Boolean);
    const avgScore = Math.round(getawayPhotos.reduce((acc, p) => acc + p.aestheticScore, 0) / getawayPhotos.length);

    albums.push({
      id: 'album-weekend-getaways',
      title: 'Weekend Getaways & Road Journeys',
      subtitle: `Escaping the everyday: 48-hour sprints, scenic detours, and spontaneous hotel keys`,
      category: 'getaways',
      badge: '🚗 Escape Collection',
      coverPhotoId: sorted[0].id,
      photoIds: getawayPhotos.map(p => p.id),
      dateRange: rangeStr,
      startDate: start,
      endDate: end,
      primaryTags: ['Road Trips', 'Weekend Escapes', 'Scenic Overlooks', 'City Breaks'],
      matchedReasons: ['Filtered for Friday–Sunday date clusters', 'Cross-referenced non-home cities in library_index.json', 'Visual triggers: convertible, sunglasses, scenic overlooks'],
      nostalgicStory: `No tight agendas, just two carry-on bags in the trunk and a collaborative playlist. From coastal switchbacks to mountain lodges, every getaway felt like stepping into our own private world.`,
      locations,
      averageAestheticScore: avgScore,
      songSuggestion: {
        title: 'Ventura Highway',
        artist: 'America',
        vibe: 'Wanderlust road trip',
      },
    });
  }

  // 3. Theme: 'Romantic Dinners & Toasts'
  // Logic: context 'Anniversary Dinner' or 'Cozy Date' or tags containing wine, candlelight, dinner, toast, pasta, restaurant, yakitori
  const romanticFoodPhotos = usablePhotos.filter(p => {
    const hasFoodWine = p.visualTriggers.hasFoodOrWine || p.visualTriggers.hasCake;
    const isRomanticContext = p.context === 'Anniversary Dinner' || p.context === 'Cozy Date';
    const hasDinnerTag = (p.semanticTags || []).some(t => /candlelight|wine|dinner|toast|pasta|restaurant|table|tuscany|yakitori|sake/i.test(t));
    return isRomanticContext || (hasFoodWine && hasDinnerTag);
  });

  if (romanticFoodPhotos.length > 0) {
    const sorted = [...romanticFoodPhotos].sort((a, b) => b.aestheticScore - a.aestheticScore);
    const { rangeStr, start, end } = formatDateRange(romanticFoodPhotos);
    const locations = Array.from(new Set(romanticFoodPhotos.map(p => p.location.city || p.location.name))).filter(Boolean);
    const avgScore = Math.round(romanticFoodPhotos.reduce((acc, p) => acc + p.aestheticScore, 0) / romanticFoodPhotos.length);

    albums.push({
      id: 'album-romantic-dinners',
      title: 'Candlelit Dinners & Secret Toasts',
      subtitle: `Handmade pasta, Tuscan Chianti, and red paper lanterns in Tokyo backstreets`,
      category: 'romance',
      badge: '🍷 Culinary Romance',
      coverPhotoId: sorted[0].id,
      photoIds: romanticFoodPhotos.map(p => p.id),
      dateRange: rangeStr,
      startDate: start,
      endDate: end,
      primaryTags: ['Candlelight', 'Fine Wine', 'Handmade Pasta', 'Tokyo Alleyways'],
      matchedReasons: ['Visual trigger: hasFoodOrWine + hasCake', 'Context: Anniversary Dinner & Evening Strolls', 'Semantic tags: candlelight, wine, toast'],
      nostalgicStory: `Quiet corners of bustling restaurants where the rest of the room blurred away. From toasting our anniversary in Florence to sharing skewers under neon rain in Shinjuku, every meal was a celebration of us.`,
      locations,
      averageAestheticScore: avgScore,
      songSuggestion: {
        title: 'La Vie en Rose',
        artist: 'Édith Piaf / Louis Armstrong',
        vibe: 'Intimate candlelit jazz',
      },
    });
  }

  // 4. Theme: 'Alpine & Nature Adventures'
  // Logic: context 'Mountain Hike' or tags 'hiking', 'mountain', 'dolomites', 'rainier', 'summit', 'trail', 'flannel'
  const adventurePhotos = usablePhotos.filter(p => {
    const isHike = p.context === 'Mountain Hike';
    const hasNatureTag = (p.semanticTags || []).some(t => /mountain|hike|dolomites|rainier|summit|trail|foliage|alpine|flannel/i.test(t));
    return isHike || hasNatureTag;
  });

  if (adventurePhotos.length > 0) {
    const sorted = [...adventurePhotos].sort((a, b) => b.aestheticScore - a.aestheticScore);
    const { rangeStr, start, end } = formatDateRange(adventurePhotos);
    const locations = Array.from(new Set(adventurePhotos.map(p => p.location.city || p.location.name))).filter(Boolean);
    const avgScore = Math.round(adventurePhotos.reduce((acc, p) => acc + p.aestheticScore, 0) / adventurePhotos.length);

    albums.push({
      id: 'album-alpine-adventures',
      title: 'Alpine Trails & Summit Horizons',
      subtitle: `Crisp mountain air, jagged ridgelines, and rewarding trail sandwiches at 8,000 feet`,
      category: 'adventures',
      badge: '🏔️ Expedition Collection',
      coverPhotoId: sorted[0].id,
      photoIds: adventurePhotos.map(p => p.id),
      dateRange: rangeStr,
      startDate: start,
      endDate: end,
      primaryTags: ['Mountain Peaks', 'Autumn Foliage', 'Trail Summits', 'Dolomites'],
      matchedReasons: ['Context: Mountain Hike', 'High aesthetic rating on landscape backgrounds', 'Semantic tags: dolomites, rainier, ridge, summit'],
      nostalgicStory: `Early morning wake-up alarms and hiking boots laced tight. Standing hand in hand at the ridge overlook as the morning mist unveiled the peaks made every steep mile worthwhile.`,
      locations,
      averageAestheticScore: avgScore,
      songSuggestion: {
        title: 'Holocene',
        artist: 'Bon Iver',
        vibe: 'Panoramic & reflective',
      },
    });
  }

  // 5. Theme: 'Cozy Mornings & Home Sanctuary'
  // Logic: context 'Home Cooking' or tags 'cooking', 'sourdough', 'coffee', 'kitchen', 'pajamas', 'puppy', 'milo', 'apartment'
  const cozyPhotos = usablePhotos.filter(p => {
    const isHome = p.context === 'Home Cooking' || p.location.city === 'Seattle' || p.location.name.includes('Apartment');
    const hasCozyTag = (p.semanticTags || []).some(t => /coffee|cooking|kitchen|pajamas|breakfast|sourdough|baking|puppy|adoption|shelter|milo/i.test(t));
    return (isHome && hasCozyTag) || p.visualTriggers.hasPets;
  });

  if (cozyPhotos.length > 0) {
    const sorted = [...cozyPhotos].sort((a, b) => b.aestheticScore - a.aestheticScore);
    const { rangeStr, start, end } = formatDateRange(cozyPhotos);
    const locations = Array.from(new Set(cozyPhotos.map(p => p.location.city || p.location.name))).filter(Boolean);
    const avgScore = Math.round(cozyPhotos.reduce((acc, p) => acc + p.aestheticScore, 0) / cozyPhotos.length);

    albums.push({
      id: 'album-cozy-mornings',
      title: 'Cozy Mornings & Home Sanctuary',
      subtitle: `Sourdough baking, steaming mugs of pour-over coffee, and four new paws on the rug`,
      category: 'cozy',
      badge: '☕ Sanctuary Collection',
      coverPhotoId: sorted[0].id,
      photoIds: cozyPhotos.map(p => p.id),
      dateRange: rangeStr,
      startDate: start,
      endDate: end,
      primaryTags: ['Sunday Breakfast', 'Fresh Sourdough', 'Milo the Puppy', 'Pajama Mornings'],
      matchedReasons: ['Home location matching (Our Cozy Apartment, Seattle)', 'Visual trigger: hasPets + hasFood', 'Semantic tags: flour on face, coffee, adoption'],
      nostalgicStory: `The quiet rhythms of ordinary days that ended up meaning everything. Rainy Sunday mornings with coffee brewing, flour scattered across the countertop, and Milo asleep at our feet.`,
      locations,
      averageAestheticScore: avgScore,
      songSuggestion: {
        title: 'Banana Pancakes',
        artist: 'Jack Johnson',
        vibe: 'Lazy Sunday acoustic',
      },
    });
  }

  // 6. Theme: 'Milestones & Forever Promises'
  // Logic: context 'Proposal & Ring', 'Celebration & Party', or tags 'proposal', 'ring', 'anniversary', 'adoption', 'she said yes'
  const milestonePhotos = usablePhotos.filter(p => {
    const isProposal = p.context === 'Proposal & Ring' || p.visualTriggers.hasRing;
    const isAnniversary = p.context === 'Anniversary Dinner' || (p.semanticTags || []).some(t => t.includes('anniversary'));
    const isPetAdoption = p.visualTriggers.hasPets || (p.semanticTags || []).some(t => t.includes('adoption'));
    return isProposal || isAnniversary || isPetAdoption;
  });

  if (milestonePhotos.length > 0) {
    const sorted = [...milestonePhotos].sort((a, b) => b.aestheticScore - a.aestheticScore);
    const { rangeStr, start, end } = formatDateRange(milestonePhotos);
    const locations = Array.from(new Set(milestonePhotos.map(p => p.location.city || p.location.name))).filter(Boolean);
    const avgScore = Math.round(milestonePhotos.reduce((acc, p) => acc + p.aestheticScore, 0) / milestonePhotos.length);

    albums.push({
      id: 'album-milestones-promises',
      title: 'Milestones & Forever Promises',
      subtitle: `The big & beautiful chapters: the Italian Alps proposal, 3-year anniversary, and welcoming Milo`,
      category: 'milestones',
      badge: '💍 Milestone Anchors',
      coverPhotoId: sorted[0].id,
      photoIds: milestonePhotos.map(p => p.id),
      dateRange: rangeStr,
      startDate: start,
      endDate: end,
      primaryTags: ['Seceda Proposal', 'Anniversary Toast', 'Milo Adoption', 'Forever Promises'],
      matchedReasons: ['Visual trigger: hasRing + hasCake + hasPets', 'Context: Proposal & Ring, Anniversary Dinner', 'Key life turning points'],
      nostalgicStory: `The moments where time seemed to hold its breath. From getting down on one knee in the Dolomites to holding our puppy for the first time, these are the anchors of our story.`,
      locations,
      averageAestheticScore: avgScore,
      songSuggestion: {
        title: 'Turning Page',
        artist: 'Sleeping At Last',
        vibe: 'Emotional & sweeping strings',
      },
    });
  }

  return albums;
}

/**
 * Generates a dynamic custom themed album based on custom keywords or user query.
 */
export function generateCustomThemedAlbum(
  query: string,
  photos: PhotoItem[],
  profile: CoupleProfile
): ThemedAlbum | null {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return null;

  const terms = cleanQuery.split(/\s+/).filter(w => w.length > 1);

  // Score each photo based on tag matching, title matching, location, and context
  const matched = photos
    .filter(p => !p.visualTriggers.isClutterOrReceipt)
    .map(photo => {
      let score = 0;
      const haystack = [
        photo.title,
        photo.location.name,
        photo.location.city,
        photo.location.country,
        photo.context,
        ...(photo.semanticTags || []),
        photo.nostalgicSummary,
      ].join(' ').toLowerCase();

      terms.forEach(term => {
        if (haystack.includes(term)) {
          score += 10;
        }
      });

      return { photo, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || b.photo.aestheticScore - a.photo.aestheticScore)
    .map(item => item.photo);

  if (matched.length === 0) return null;

  const { rangeStr, start, end } = formatDateRange(matched);
  const locations = Array.from(new Set(matched.map(p => p.location.city || p.location.name))).filter(Boolean);
  const avgScore = Math.round(matched.reduce((acc, p) => acc + p.aestheticScore, 0) / matched.length);

  // Capitalize title
  const formattedTitle = query
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    id: `album-custom-${Date.now()}`,
    title: formattedTitle,
    subtitle: `Custom curated collection generated from semantic index for ${profile.partner1Name} & ${profile.partner2Name}`,
    category: 'custom',
    badge: '✨ Custom Semantic Theme',
    coverPhotoId: matched[0].id,
    photoIds: matched.map(p => p.id),
    dateRange: rangeStr,
    startDate: start,
    endDate: end,
    primaryTags: matched.flatMap(p => p.semanticTags.slice(0, 2)).slice(0, 5),
    matchedReasons: [`Searched for "${query}" across semantic tags and location indices`, `Selected ${matched.length} highest scoring matches`],
    nostalgicStory: `A bespoke collection gathered around "${formattedTitle}". These moments reflect our shared memories, from ${locations.slice(0, 2).join(' to ')} and beyond.`,
    locations,
    averageAestheticScore: avgScore,
    songSuggestion: {
      title: 'Golden Hour (Lofi Beats)',
      artist: 'TogetherLens Mood Engine',
      vibe: 'Reflective & dreamy',
    },
    isUserCustom: true,
  };
}
