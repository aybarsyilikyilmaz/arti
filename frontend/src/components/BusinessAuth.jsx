import React, { useState } from 'react';

export default function BusinessAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    businessType: 'restoran'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    // Backend API URL mapping based on form mode
    const endpoint = isLogin ? '/api/v1/business/login' : '/api/v1/business/register';
    const apiUrl = `http://localhost:5000${endpoint}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setMessage({ type: 'success', text: isLogin ? 'Sisteme başarıyla giriş yapıldı!' : 'İşletme kaydınız başarıyla oluşturuldu!' });
        
        // Save the JWT Token to the local storage
        if (data.token) localStorage.setItem('token', data.token);
      } else {
        setMessage({ type: 'error', text: data.message || 'Bir hata oluştu. Lütfen tekrar deneyin.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {isLogin ? 'İşletme Hesabınıza Giriş Yapın' : 'İşletmenizi Kaydedin'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Fazla gıdaları gelire dönüştürün, çevreyi koruyun.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <label className="block text-sm font-medium text-gray-700">İşletme Adı</label>
                  <div className="mt-1">
                    <input name="name" type="text" required={!isLogin} value={formData.name} onChange={handleChange} className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon Numarası</label>
                  <div className="mt-1">
                    <input name="phone" type="text" required={!isLogin} value={formData.phone} onChange={handleChange} className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm transition-colors" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tam Adres</label>
                  <div className="mt-1">
                    <textarea name="address" rows="3" required={!isLogin} value={formData.address} onChange={handleChange} className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm transition-colors resize-none"></textarea>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">İşletme Tipi</label>
                  <div className="mt-1">
                    <select name="businessType" value={formData.businessType} onChange={handleChange} className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-brand focus:border-brand sm:text-sm transition-colors">
                      <option value="restoran">Restoran</option>
                      <option value="firin">Fırın / Pastane</option>
                      <option value="market">Süpermarket</option>
                      <option value="diger">Diğer</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">E-posta Adresi</label>
              <div className="mt-1">
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Şifre</label>
              <div className="mt-1">
                <input name="password" type="password" required value={formData.password} onChange={handleChange} className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm transition-colors" />
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? 'İşleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <button onClick={() => { setIsLogin(!isLogin); setMessage(null); }} className="font-medium text-brand hover:text-brand-dark text-sm transition-colors">
              {isLogin ? "İşletmenizi henüz kaydetmediniz mi? Hemen kayıt olun." : "Zaten bir hesabınız var mı? Buradan giriş yapın."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
