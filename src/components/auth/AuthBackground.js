export default function AuthBackground({text1, text2}) {
    return (
        <div className="hidden lg:block w-1/2 bg-green-600 relative">
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
                <h1 className="text-4xl font-bold mb-6">{text1}</h1>
                <p className="text-xl text-center max-w-md">
                    {text2}
                </p>
            </div>
        </div>
    );
}