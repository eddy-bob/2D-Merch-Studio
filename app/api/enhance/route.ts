import { NextRequest, NextResponse } from "next/server";
import { MerchDesignEnhancer, ProductType } from "merch-design-enhancer";

// Map UI product types to ProductType enum
const productTypeMap: Record<string, ProductType> = {
  "t-shirt": ProductType.SHIRT,
  hoodie: ProductType.HOODIE,
  mug: ProductType.MUG,
  poster: ProductType.STICKER_PAD, // Using sticker_pad as closest match
  sticker: ProductType.STICKER_PAD,
  "tote-bag": ProductType.TOTE_BAG,
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const productType = formData.get("productType") as string;
    const color = formData.get("color") as string | null;
    const apiKey = formData.get("apiKey") as string | null;
    const provider = (formData.get("provider") as string) || "nanobanana";

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Map product type
    const mappedProductType = productTypeMap[productType] || ProductType.SHIRT;

    // Initialize enhancer
    const enhancer = new MerchDesignEnhancer({
      apiKey,
      provider: provider as "nanobanana" | "openai" | "stability" | "replicate",
    });

    // Enhance the image
    const result = await enhancer.enhanceImage({
      image: imageBuffer,
      productType: mappedProductType,
      color: color || undefined,
    });
    console.log(result);

    // Convert buffer to base64 for response
    const base64Image = result.image.toString("base64");
    const dataUri = `data:${result.mimeType};base64,${base64Image}`;

    return NextResponse.json({
      success: true,
      image: dataUri,
      mimeType: result.mimeType,
    });
  } catch (error: any) {
    console.error("Enhancement error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to enhance image",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
