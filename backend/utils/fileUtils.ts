import path from "path";
import fs from "fs";


export const deleteLocalImageIfExists = (
    imageUrl?: string | null
) => {

    if (!imageUrl) {
        return;
    }

    if (
        !imageUrl.startsWith(
            "/uploads/products/"
        )
    ) {
        return;
    }

    const filename =
        path.basename(imageUrl);

    const fullPath =
        path.resolve(
            __dirname,
            "../uploads/products",
            filename
        );

    if (!fs.existsSync(fullPath)) {
        return;
    }

    try {

        fs.unlinkSync(fullPath);

    } catch (error) {

        console.error(
            "Failed to delete local image:",
            error
        );
    }
};