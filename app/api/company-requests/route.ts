import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createCompanyRequest } from '@/lib/database/queries';
import { createNotification } from '@/lib/services/notification-service';

const CompanyRequestSchema = z.object({
    companyName: z.string().min(1),
    description: z.string().min(1),
    categoryId: z.string().min(1),
    countryId: z.string().min(1),
    cityId: z.string().min(1),
    address: z.string().optional(),
    phone: z.string().min(1),
    email: z.string().email(),
    website: z.string().url().optional().or(z.literal('')),
    foundedYear: z.number().int().optional(),
    companySize: z.string().optional(),
    services: z.string().min(1),
    ownerName: z.string().min(1),
    ownerEmail: z.string().email(),
    ownerPhone: z.string().min(1),
    socialMediaLinks: z.object({
        facebook: z.string().url().optional().or(z.literal('')),
        twitter: z.string().url().optional().or(z.literal('')),
        instagram: z.string().url().optional().or(z.literal('')),
        linkedin: z.string().url().optional().or(z.literal('')),
    }).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = CompanyRequestSchema.parse(body);

        const country = await prisma.country.findUnique({ where: { id: validatedData.countryId } });
        const city = await prisma.city.findUnique({ where: { id: validatedData.cityId } });
        const category = await prisma.category.findUnique({ where: { id: validatedData.categoryId } });

        if (!country || !city || !category) {
            return NextResponse.json({ success: false, error: 'Invalid country, city or category' }, { status: 400 });
        }

        const companyRequest = await createCompanyRequest({
            companyName: validatedData.companyName,
            description: validatedData.description,
            category: category.name,
            country: country.name,
            city: city.name,
            address: validatedData.address,
            phone: validatedData.phone,
            email: validatedData.email,
            website: validatedData.website,
            foundedYear: validatedData.foundedYear,
            companySize: validatedData.companySize,
            services: validatedData.services,
            ownerName: validatedData.ownerName,
            ownerEmail: validatedData.ownerEmail,
            ownerPhone: validatedData.ownerPhone,
            socialMedia: validatedData.socialMediaLinks,
        });

        await createNotification({
            type: 'SYSTEM',
            title: 'طلب انضمام جديد',
            message: `تم استلام طلب انضمام جديد من شركة ${validatedData.companyName}`,
            data: { companyRequestId: companyRequest.id },
        });

        return NextResponse.json({ success: true, data: companyRequest });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
    }
}