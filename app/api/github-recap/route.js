import { Octokit } from 'octokit';
import { NextResponse } from 'next/server';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

export async function POST(req) {
    try {
        const { username } = await req.json();

        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        const [userResponse, reposResponse] = await Promise.all([
            octokit.rest.users.getByUsername({ username }),
            octokit.rest.repos.listForUser({
                username,
                per_page: 100,
                sort: 'updated'
            }),
        ]);

        const user = userResponse.data;
        const repos = reposResponse.data;

        const eventsResponse = await octokit.rest.activity.listPublicEventsForUser({
            username,
            per_page: 100
        });
        const events = eventsResponse.data;

        const contributionData = await fetchContributions2025(username);

        const stats = await calculateStats(username, repos, events, contributionData);

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    name: user.name,
                    avatar: user.avatar_url,
                    username: user.login,
                    bio: user.bio,
                    followers: user.followers,
                    following: user.following,
                },
                stats,
            },
        });
    } catch (error) {
        console.error('GitHub API Error:', error);

        if (error.status === 404) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch GitHub data' },
            { status: 500 }
        );
    }
}

async function fetchContributions2025(username) {
    const query = `
        query($username: String!, $from: DateTime!, $to: DateTime!) {
            user(login: $username) {
                contributionsCollection(from: $from, to: $to) {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                contributionCount
                                date
                            }
                        }
                    }
                    totalCommitContributions
                    totalIssueContributions
                    totalPullRequestContributions
                    totalPullRequestReviewContributions
                }
            }
        }
    `;

    const variables = {
        username,
        from: '2025-01-01T00:00:00Z',
        to: '2025-12-31T23:59:59Z'
    };

    try {
        const response = await octokit.graphql(query, variables);
        return response.user.contributionsCollection;
    } catch (error) {
        console.error('GraphQL Error:', error);
        return null;
    }
}

async function calculateStats(username, repos, events, contributionData) {
    const year2025Start = new Date('2025-01-01T00:00:00Z');
    const year2025End = new Date('2025-12-31T23:59:59Z');

    const repos2025 = repos.filter(repo => {
        const createdDate = new Date(repo.created_at);
        const updatedDate = new Date(repo.updated_at);
        return (createdDate >= year2025Start && createdDate <= year2025End) ||
            (updatedDate >= year2025Start && updatedDate <= year2025End);
    });

    const languages = {};
    let totalStars = 0;
    let totalForks = 0;

    repos2025.forEach((repo) => {
        if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
        totalStars += repo.stargazers_count;
        totalForks += repo.forks_count;
    });

    const topLanguages = Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([lang, count]) => ({ language: lang, count }));

    let totalCommits = 0;
    let pullRequests = 0;
    let issues = 0;
    let commitsByDay = {};

    if (contributionData) {
        totalCommits = contributionData.totalCommitContributions;
        pullRequests = contributionData.totalPullRequestContributions;
        issues = contributionData.totalIssueContributions;

        contributionData.contributionCalendar.weeks.forEach(week => {
            week.contributionDays.forEach(day => {
                if (day.contributionCount > 0) {
                    commitsByDay[day.date] = day.contributionCount;
                }
            });
        });
    }

    const hourlyActivity = new Array(24).fill(0);
    const eventTypes = {};

    events.forEach((event) => {
        eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
        const date = new Date(event.created_at);
        const hour = date.getHours();
        hourlyActivity[hour]++;
    });

    const mostActiveHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));

    const mostActiveDay = Object.entries(commitsByDay)
        .sort(([, a], [, b]) => b - a)[0];

    const streak = calculateStreak(commitsByDay);

    const personality = determineCodingPersonality(mostActiveHour, totalCommits, repos2025.length);

    return {
        totalRepos: repos2025.length,
        totalStars,
        totalForks,
        topLanguages,
        totalCommits,
        pullRequests,
        issues,
        mostActiveDay: mostActiveDay ? mostActiveDay[0] : null,
        mostActiveHour,
        hourlyActivity,
        currentStreak: streak,
        personality,
        year: 2025,
    };
}

function calculateStreak(commitsByDay) {
    const sortedDays = Object.keys(commitsByDay).sort().reverse();
    let streak = 0;
    let previousDate = null;

    for (const day of sortedDays) {
        const dayDate = new Date(day);

        if (previousDate === null) {
            streak = 1;
            previousDate = dayDate;
        } else {
            const diffTime = previousDate.getTime() - dayDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                streak++;
                previousDate = dayDate;
            } else {
                break;
            }
        }
    }

    return streak;
}

function determineCodingPersonality(hour, commits, repos) {
    if (hour >= 22 || hour <= 4) return 'Night Owl';
    if (hour >= 5 && hour <= 9) return 'Early Bird';
    if (commits > 500) return 'Commit Machine';
    if (repos > 50) return 'Project Creator';
    return 'Steady Contributor';
}