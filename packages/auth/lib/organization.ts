import { db } from "@app/database";

export async function getOrganizationMembership(
    userId: string,
    organizationId: string,
) {
    // Use the correct compound key format that matches your schema
    const membership = await db.member.findUnique({
        where: {
            organizationId_userId: {
                organizationId,
                userId,
            },
        },
    });

    return membership;
}

export async function updateSeatsInOrganization(
    organizationId: string,
) {
    const organization = await db.organization.findUnique({
        where: { id: organizationId },
        include: {
            purchases: true,
            _count: {
                select: {
                    members: true,
                },
            },
        },
    });

    if (!organization?.purchases.length) {
        return;
    }

    const activeSubscription = organization.purchases.find(
        (purchase) => purchase.type === "SUBSCRIPTION",
    );

    if (!activeSubscription?.subscriptionId) {
        return;
    }

    try {
        // Placeholder for subscription seats update
        // Replace this with your actual implementation later
        console.log(`Would update subscription ${activeSubscription.subscriptionId} to ${organization._count.members} seats`);
    } catch (error) {
        console.error("Could not update seats in organization subscription", {
            organizationId,
            error,
        });
    }
}