import React from 'react'
const SettingSideBar = ({ selectedProvider, setSelectedProvider }: { selectedProvider: 'text-provider' | 'image-provider', setSelectedProvider: (provider: 'text-provider' | 'image-provider') => void }) => {
    return (
        <div className='w-full max-w-[230px] h-screen px-4 pt-[22px] bg-[#F9FAFB]'>
            <p className='text-xs text-black  font-medium border-b mt-[3.15rem]  border-[#E1E1E5] pb-3.5'>FILTER BY:</p>
            <div className='mt-6'>
                <p className='text-[#3A3A3A] text-xs font-medium pb-2.5'>Select Provider</p>
                <div className='space-y-2.5'>
                    <button className={` w-full rounded-[6px] p-3 py-4 flex items-center gap-1.5 border  ${selectedProvider === 'text-provider' ? 'bg-[#F4F3FF] border-[#D9D6FE]' : 'bg-white border-[#E1E1E5]'}`} onClick={() => setSelectedProvider('text-provider')}>
                        <div className='relative w-6 h-6 rounded-full overflow-hidden border border-[#EDEEEF]'>

                            <img src='/providers/openai.png' className=' object-cover w-full h-full overflow-hidden' alt='google' />
                        </div>
                        <p className='text-[#191919] text-xs  font-medium' >Text Provider</p>
                    </button>
                    <button className={` w-full rounded-[6px] p-3 py-4 flex items-center gap-1.5 border  ${selectedProvider === 'image-provider' ? 'bg-[#F4F3FF] border-[#D9D6FE]' : 'bg-white border-[#E1E1E5]'}`} onClick={() => setSelectedProvider('image-provider')}>
                        <div className='relative w-6 h-6 rounded-full overflow-hidden border border-[#EDEEEF]'>
                            <img src='/providers/image-provider.png' className=' object-cover w-full h-full overflow-hidden' alt='google' />
                        </div>
                        <p className='text-[#191919] text-xs  font-medium' >Image Provider</p>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SettingSideBar
