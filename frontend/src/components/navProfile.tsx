export default function NavProfile({displayName, photoUrl}: {displayName: string|null, photoUrl: string|null}) {
    return <div className="flex justify-end">
        <div className="rounded-full">
            {photoUrl ? <img src={photoUrl} alt="Teri Photu"/> : null}
        </div>
        <div className="font-mono text-black">
            {displayName}
        </div>
    </div>
}