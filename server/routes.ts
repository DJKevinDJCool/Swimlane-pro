import type { Express } from "express";
import { createServer, type Server } from "node:http";

const SWIMLANE_BASE = "https://api.swimlanelive.com/api";
const SWIMIFY_BASE = "https://data-eu.swimify.com/v1/graphql";
const SWIMIFY_API_KEY = process.env.SWIMIFY_API_KEY || "";

interface SwimlaneMeet {
  id: number;
  name: string;
  location: string;
  organizer: string;
  startDate: string;
  endDate: string;
  medleyLivetimingPath: string;
  numberOfLanes: number;
  numberOfPlates?: number;
  poolSize?: number;
  showHeatList?: boolean;
  showResultList?: boolean;
  showStartList?: boolean;
  showTimeSchedule?: boolean;
  meetLogoUrl?: string;
  countryCode?: string;
}

interface SwimifyCompetition {
  id: string;
  name: string;
  seo_text: string;
  startDate: string;
  endDate: string;
  large_image: string | null;
  small_image: string | null;
  nation_code: string;
  organizer: string;
  organizer_logo: string | null;
  pool_name: string;
  pool_type: number;
  city: string;
}

async function fetchSwimlaneMeets(
  year: number,
  active: boolean,
  countryCode: string = "NONE"
): Promise<SwimlaneMeet[]> {
  try {
    const url = `${SWIMLANE_BASE}/MeetList/${year}/${active}/${countryCode}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Swimlane API error: ${response.status}`);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching Swimlane meets:", error);
    return [];
  }
}

async function fetchSwimifyCompetitions(
  nationCode?: string
): Promise<SwimifyCompetition[]> {
  if (!SWIMIFY_API_KEY) {
    console.warn("Swimify API key not configured");
    return [];
  }

  try {
    const query = `
      query GetCompetitions($where: competitions_bool_exp) {
        competitions(
          where: $where
          order_by: { startDate: desc }
          limit: 50
        ) {
          id
          name
          seo_text
          startDate
          endDate
          large_image
          small_image
          nation_code
          organizer
          organizer_logo
          pool_name
          pool_type
          city
        }
      }
    `;

    const variables: any = {};
    if (nationCode && nationCode !== "all") {
      variables.where = { nation_code: { _eq: nationCode } };
    }

    const response = await fetch(SWIMIFY_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": SWIMIFY_API_KEY,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      console.error(`Swimify API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.data?.competitions || [];
  } catch (error) {
    console.error("Error fetching Swimify competitions:", error);
    return [];
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/meets", async (req, res) => {
    try {
      const filter = (req.query.filter as string) || "all";
      const year = new Date().getFullYear();

      let swimlaneMeets: SwimlaneMeet[] = [];
      let swimifyCompetitions: SwimifyCompetition[] = [];

      if (filter === "all" || filter === "NOR") {
        swimlaneMeets = await fetchSwimlaneMeets(year, true, "NOR");
      }

      if (filter === "all" || filter === "SWE") {
        const sweCompetitions = await fetchSwimifyCompetitions("SWE");
        swimifyCompetitions = [...swimifyCompetitions, ...sweCompetitions];
      }

      if (filter === "all" || filter === "INT") {
        const intCompetitions = await fetchSwimifyCompetitions();
        swimifyCompetitions = [...swimifyCompetitions, ...intCompetitions];
      }

      const normalizedSwimlane = swimlaneMeets.map((meet) => ({
        id: meet.id,
        name: meet.name,
        location: meet.location,
        organizer: meet.organizer,
        startDate: meet.startDate,
        endDate: meet.endDate,
        medleyLivetimingPath: meet.medleyLivetimingPath,
        numberOfLanes: meet.numberOfLanes,
        numberOfPlates: meet.numberOfPlates,
        poolSize: meet.poolSize,
        showHeatList: meet.showHeatList,
        showResultList: meet.showResultList,
        showStartList: meet.showStartList,
        showTimeSchedule: meet.showTimeSchedule,
        meetLogoUrl: meet.meetLogoUrl,
        countryCode: meet.countryCode || "NOR",
        source: "swimlane" as const,
        isLive: true,
      }));

      const normalizedSwimify = swimifyCompetitions.map((comp) => ({
        id: comp.id,
        name: comp.name,
        location: comp.city,
        organizer: comp.organizer,
        startDate: comp.startDate,
        endDate: comp.endDate,
        numberOfLanes: 8,
        seoText: comp.seo_text,
        largeImage: comp.large_image,
        smallImage: comp.small_image,
        nationCode: comp.nation_code,
        poolName: comp.pool_name,
        poolType: comp.pool_type,
        city: comp.city,
        source: "swimify" as const,
        isLive: false,
      }));

      const allMeets = [...normalizedSwimlane, ...normalizedSwimify];

      allMeets.sort((a, b) => {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      });

      res.json(allMeets);
    } catch (error) {
      console.error("Error in /api/meets:", error);
      res.status(500).json({ error: "Failed to fetch meets" });
    }
  });

  app.get("/api/meets/live", async (req, res) => {
    try {
      const year = new Date().getFullYear();
      const meets = await fetchSwimlaneMeets(year, true, "NOR");

      const now = new Date();
      const liveMeets = meets.filter((meet) => {
        const start = new Date(meet.startDate);
        const end = new Date(meet.endDate);
        end.setDate(end.getDate() + 1);
        return now >= start && now <= end;
      });

      const normalized = liveMeets.map((meet) => ({
        id: meet.id,
        name: meet.name,
        location: meet.location,
        organizer: meet.organizer,
        startDate: meet.startDate,
        endDate: meet.endDate,
        medleyLivetimingPath: meet.medleyLivetimingPath,
        numberOfLanes: meet.numberOfLanes,
        meetLogoUrl: meet.meetLogoUrl,
        source: "swimlane" as const,
        isLive: true,
      }));

      res.json(normalized);
    } catch (error) {
      console.error("Error in /api/meets/live:", error);
      res.status(500).json({ error: "Failed to fetch live meets" });
    }
  });

  app.get("/api/meets/:meetId/details", async (req, res) => {
    try {
      const { meetId } = req.params;
      const url = `${SWIMLANE_BASE}/MeetEvents/${meetId}`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(response.status).json({ error: "Meet not found" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching meet details:", error);
      res.status(500).json({ error: "Failed to fetch meet details" });
    }
  });

  app.get("/api/meets/:meetId/swimmers", async (req, res) => {
    try {
      const { meetId } = req.params;
      const url = `${SWIMLANE_BASE}/Swimmers/${meetId}`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(response.status).json({ error: "Swimmers not found" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching swimmers:", error);
      res.status(500).json({ error: "Failed to fetch swimmers" });
    }
  });

  app.get("/api/meets/:meetId/stats", async (req, res) => {
    try {
      const { meetId } = req.params;
      const swimmersUrl = `${SWIMLANE_BASE}/Swimmers/${meetId}`;
      const detailsUrl = `${SWIMLANE_BASE}/MeetEvents/${meetId}`;

      const [swimmersRes, detailsRes] = await Promise.all([
        fetch(swimmersUrl),
        fetch(detailsUrl),
      ]);

      if (!swimmersRes.ok || !detailsRes.ok) {
        return res.status(404).json({ error: "Stats not found" });
      }

      const swimmers = await swimmersRes.json();
      const details = await detailsRes.json();

      let maleCount = 0;
      let femaleCount = 0;
      const clubSet = new Set<number>();

      if (Array.isArray(swimmers)) {
        swimmers.forEach((swimmer: any) => {
          // Males: no gender field (undefined)
          // Females: gender === -1
          // Mixed: gender === -2
          if (swimmer.gender === undefined || swimmer.gender === null) maleCount++;
          else if (swimmer.gender === -1) femaleCount++;
          if (swimmer.meetSwimClubNumber) {
            clubSet.add(swimmer.meetSwimClubNumber);
          }
        });
      }

      const sessions = details.sessions || [];
      let totalEvents = 0;
      sessions.forEach((session: any) => {
        if (session.meetEvents) {
          totalEvents += session.meetEvents.length;
        }
      });

      const stats = {
        totalSwimmers: (swimmers && Array.isArray(swimmers) ? swimmers.length : 0),
        maleSwimmers: maleCount,
        femaleSwimmers: femaleCount,
        totalClubs: clubSet.size,
        totalEvents,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/meets/:meetId/documents", async (req, res) => {
    try {
      const { meetId } = req.params;
      const url = `${SWIMLANE_BASE}/Documents/${meetId}`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(response.status).json({ error: "Documents not found" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/meets/:meetId/schedule", async (req, res) => {
    try {
      const { meetId } = req.params;
      const url = `${SWIMLANE_BASE}/MeetSchedule/${meetId}`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(response.status).json({ error: "Schedule not found" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ error: "Failed to fetch schedule" });
    }
  });

  app.get("/api/meets/:meetId/events/:eventNumber/races", async (req, res) => {
    try {
      const { meetId, eventNumber } = req.params;
      const url = `${SWIMLANE_BASE}/Race/${meetId}/${eventNumber}`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(response.status).json({ error: "Races not found" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching races:", error);
      res.status(500).json({ error: "Failed to fetch races" });
    }
  });

  app.get("/api/meets/:meetId/live", async (req, res) => {
    try {
      const { meetId } = req.params;
      const url = `${SWIMLANE_BASE}/LiveRaceCollection/${meetId}`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(response.status).json({ error: "Live data not found" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching live data:", error);
      res.status(500).json({ error: "Failed to fetch live data" });
    }
  });

  app.get("/api/meets/:meetId/live/updateId", async (req, res) => {
    try {
      const { meetId } = req.params;
      const url = `${SWIMLANE_BASE}/Live/${meetId}/updateId`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(response.status).json({ error: "Update ID not found" });
      }

      const data = await response.text();
      res.json({ updateId: parseInt(data, 10) });
    } catch (error) {
      console.error("Error fetching update ID:", error);
      res.status(500).json({ error: "Failed to fetch update ID" });
    }
  });

  app.get("/api/meets/:meetId/live/event", async (req, res) => {
    try {
      const { meetId } = req.params;
      const updateId = req.query.updateId as string;

      if (!updateId) {
        return res.status(400).json({ error: "updateId required" });
      }

      const url = `${SWIMLANE_BASE}/Live/${meetId}/${updateId}`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(response.status).json({ error: "Live event data not found" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching live event data:", error);
      res.status(500).json({ error: "Failed to fetch live event data" });
    }
  });

  app.get("/api/meets/:meetId/live/current", async (req, res) => {
    try {
      const { meetId } = req.params;
      
      // Fetch both the update ID and the live data
      const updateIdUrl = `${SWIMLANE_BASE}/Live/${meetId}/updateId`;
      const updateIdResponse = await fetch(updateIdUrl);

      if (!updateIdResponse.ok) {
        return res.json({ event: null, updateId: 0, isRunning: false });
      }

      const updateId = parseInt(await updateIdResponse.text(), 10);
      
      const liveDataUrl = `${SWIMLANE_BASE}/Live/${meetId}/${updateId}`;
      const liveDataResponse = await fetch(liveDataUrl);

      if (!liveDataResponse.ok) {
        return res.json({ event: null, updateId, isRunning: false });
      }

      const liveData = await liveDataResponse.json();
      
      res.json({
        event: liveData,
        updateId,
        isRunning: true,
      });
    } catch (error) {
      console.error("Error fetching current live event:", error);
      res.status(500).json({ error: "Failed to fetch current live event" });
    }
  });

  app.get("/api/meets/:meetId/clubs", async (req, res) => {
    try {
      const { meetId } = req.params;
      const swimmersUrl = `${SWIMLANE_BASE}/Swimmers/${meetId}`;
      const response = await fetch(swimmersUrl);

      if (!response.ok) {
        return res.status(404).json({ error: "Clubs not found" });
      }

      const swimmers = await response.json();

      if (!Array.isArray(swimmers)) {
        return res.json([]);
      }

      // Group swimmers by club
      const clubMap = new Map<number, any>();

      swimmers.forEach((swimmer: any) => {
        const clubId = swimmer.meetSwimClubNumber;
        if (!clubMap.has(clubId)) {
          clubMap.set(clubId, {
            id: clubId,
            name: swimmer.swimClubName || "Unknown Club",
            swimmers: [],
            maleCount: 0,
            femaleCount: 0,
          });
        }

        const club = clubMap.get(clubId)!;
        club.swimmers.push(swimmer);
        
        if (swimmer.gender === 1) {
          club.maleCount++;
        } else if (swimmer.gender === -1) {
          club.femaleCount++;
        }
      });

      const clubs = Array.from(clubMap.values()).map((club) => ({
        id: club.id,
        name: club.name,
        swimmerCount: club.swimmers.length,
        maleCount: club.maleCount,
        femaleCount: club.femaleCount,
        logoUrl: club.swimmers[0]?.swimClubLogoUrl || null,
      }));

      res.json(clubs);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      res.status(500).json({ error: "Failed to fetch clubs" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
