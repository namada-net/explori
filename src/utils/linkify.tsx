import React from 'react';
import { Link } from '@chakra-ui/react';

/**
 * Converts URLs in text to clickable hyperlinks
 */
export const linkifyText = (text: string): React.ReactNode => {
    // Simple regex to match URLs broadly
    const urlRegex = /https?:\/\/[^\s]+/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // Find all URL matches
    while ((match = urlRegex.exec(text)) !== null) {
        // Clean up the URL by removing trailing punctuation
        let cleanUrl = match[0];
        let trailingPunct = '';

        // Remove common trailing punctuation that shouldn't be part of the URL
        const trailingPunctRegex = /[.,;:!?\)\]]+$/;
        const punctMatch = cleanUrl.match(trailingPunctRegex);
        if (punctMatch) {
            trailingPunct = punctMatch[0];
            cleanUrl = cleanUrl.slice(0, -trailingPunct.length);
        }

        // Add text before the URL
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // Add the URL as a link
        parts.push(
            <Link
                key={match.index}
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="cyan.400"
                textDecoration="underline"
                _hover={{ color: "cyan.300" }}
            >
                {cleanUrl}
            </Link>
        );

        // Add the trailing punctuation as regular text
        if (trailingPunct) {
            parts.push(trailingPunct);
        }

        lastIndex = match.index + match[0].length;
    }

    // Add any remaining text after the last URL
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    // If no URLs were found, return the original text
    return parts.length > 0 ? parts : text;
};

/**
 * Checks if a value is a string that might contain URLs
 */
export const isStringWithPotentialUrls = (value: unknown): value is string => {
    return typeof value === 'string' && /https?:\/\/[^\s]+/g.test(value);
}; 