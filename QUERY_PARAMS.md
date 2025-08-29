# Query Parameters for Comment Form Prefilling

The comment form can be prefilled using URL query parameters. This allows you to create links that automatically populate the form with specific values.

## Available Parameters

### Basic Parameters

- `targetUri` - The target URL for the comment
- `channelId` - The channel ID to select
- `content` - The comment content/text

### Metadata Parameters

Use the `metadata` parameter with a comma-separated format: `key:value:type`

```
?metadata=category:review:string,rating:5:uint256
```

## Examples

### Simple Comment with Target URL

```
https://share.ethcomments.xyz/?targetUri=https://example.com&content=Great%20article!
```

### Comment with Channel and Metadata

```
https://share.ethcomments.xyz/?targetUri=https://example.com&channelId=123&content=Amazing%20content&metadata=category:review:string
```

### Comment with Multiple Metadata Entries

```
https://share.ethcomments.xyz/?targetUri=https://example.com&metadata=category:review:string,rating:5:uint256,author:john:string
```

## URL Encoding

Remember to URL encode your parameters, especially for:

- URLs in `targetUri`
- Special characters in content

### JavaScript Example

```javascript
const params = new URLSearchParams({
  targetUri: "https://example.com",
  content: "Great article!",
  metadata: "category:review:string,rating:5:uint256",
});

const url = `https://share.ethcomments.xyz/?${params.toString()}`;
```

## Notes

- All parameters are optional
- The form will automatically decode URL-encoded values
