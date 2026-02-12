import { NextResponse } from "next/server";

const fallbackMatches = [
  {
    home_team: "Match data unavailable",
    away_team: "Please try again later",
    home_score: null,
    away_score: null,
    league: "Football",
    status: "Unavailable",
    time: ""
  }
];

export async function GET() {
  const apiKey = process.env.SPORTMONKS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ matches: fallbackMatches }, { status: 200 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const url = `https://api.sportmonks.com/v3/football/fixtures?api_token=${apiKey}&filter[date]=${today}&include=participants;league;scores`;

  try {
    const response = await fetch(url, { next: { revalidate: 300 } });

    if (!response.ok) {
      return NextResponse.json({ matches: fallbackMatches }, { status: 200 });
    }

    const payload = await response.json();
    const data = Array.isArray(payload?.data) ? payload.data : [];

    const matches = data.slice(0, 5).map((fixture: any) => {
      const participants = Array.isArray(fixture?.participants) ? fixture.participants : [];
      const homeTeam = participants.find((p: any) => p?.meta?.location === "home") || participants[0];
      const awayTeam = participants.find((p: any) => p?.meta?.location === "away") || participants[1];

      let homeScore: number | null = null;
      let awayScore: number | null = null;

      const scoreEntry = Array.isArray(fixture?.scores)
        ? fixture.scores.find((s: any) => s?.description?.toLowerCase() === "current") || fixture.scores[0]
        : null;

      if (scoreEntry?.score?.participant === "home") {
        homeScore = scoreEntry.score?.goals ?? null;
      } else if (scoreEntry?.score?.participant === "away") {
        awayScore = scoreEntry.score?.goals ?? null;
      }

      return {
        home_team: homeTeam?.name || "TBD",
        away_team: awayTeam?.name || "TBD",
        home_score: homeScore,
        away_score: awayScore,
        league: fixture?.league?.name || "Football",
        status: fixture?.state?.name || fixture?.status || "Scheduled",
        time: fixture?.starting_at || ""
      };
    });

    return NextResponse.json({ matches: matches.length ? matches : fallbackMatches }, { status: 200 });
  } catch {
    return NextResponse.json({ matches: fallbackMatches }, { status: 200 });
  }
}
